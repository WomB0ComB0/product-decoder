/**
 * Copyright  
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
	gnewsSearch,
	gnewsTopHeadlines,
	googleSearch,
	youtubeSearch,
} from "@/core";
import { createFDCClient, newsapi } from "@/lib/api";

export type Category =
  | "Food"
  | "Clothes"
  | "Drugs"
  | "Technology"
  | "Unknown";

export type Primitive =
  | "News"
  | "PriceChangeHistory"
  | "ArticlesEdited";

export interface PipelineMeta {
  primaryQuery: string;
  labels: string[];
  // Optional extra context if you have it:
  brand?: string | null;
  source?: string | null;       // e.g., "amazon", "wikipedia", "bestbuy"
  locale?: string | null;       // e.g., "en-US"
  description?: string | null;  // scraped snippet
  attributes?: Record<string, string | number | boolean | null | undefined>;
}

export interface CategoryEvidence {
  matched: string[];     // tokens/regex labels that hit
  blocked: string[];     // negatives that fired (if any)
  score: number;         // final score after weights
}

export interface CategoryDecision {
  category: Category;
  evidenceByCategory: Record<Category, CategoryEvidence>;
}

export interface PrimitiveDecision {
  primitives: Primitive[];
  evidence: Record<Primitive, string[]>;
}

type Token = string | RegExp;

interface CategoryRule {
  include: Token[];
  exclude?: Token[];
  weight?: number; // multiplier on matches
}

type Ruleset = Record<Category, CategoryRule>;

const rx = {
  mg: /\b\d+\s?mg\b/i,
  rx: /\b(rx|prescription)\b/i,
  otc: /\b(otc|over[-\s]?the[-\s]?counter)\b/i,
  cpuGpu: /\b(cpu|gpu|graphics|processor|nvidia|amd|intel)\b/i,
  storage: /\b(ssd|nvme|m\.?2|sata|hdd)\b/i,
  apparelSizes: /\b(xs|s|m|l|xl|xxl|xxxl)\b/i,
  nutrition: /\b(kcal|calorie|nutrition|macros?)\b/i,
  ingredients: /\bingredients?\b/i,
  shoeSizes: /\b(us|eu|uk)\s?\d{1,2}(\.\d)?\b/i,
};

const CATEGORY_RULES: Ruleset = {
  Food: {
    include: [
      "calorie", "nutrition", "kcal", "fdc", "food", "ingredients",
      "protein", "carb", "carbs", "fat", "sugar", "vitamin", rx.nutrition, rx.ingredients,
      "grocery", "usda", "serving size", "per 100g",
    ],
    exclude: ["pet food", "dog food", "cat food"], // tweak as needed
    weight: 1.0,
  },
  Clothes: {
    include: [
      "shirt", "t-shirt", "tee", "hoodie", "sneaker", "shoe", "jeans", "dress", "jacket",
      "skirt", "top", "sweater", "outerwear", "denim", "athleisure", rx.apparelSizes, rx.shoeSizes,
    ],
    exclude: ["shoe rack", "shoe cabinet", "dress form"], // home items, not apparel
    weight: 1.0,
  },
  Drugs: {
    include: [
      "tablet", "capsule", rx.mg, rx.rx, rx.otc, "drug", "medication",
      "ibuprofen", "acetaminophen", "paracetamol", "aspirin",
      "antibiotic", "antihistamine", "supplement",
    ],
    exclude: ["drug test kit", "pill organizer", "supplement shaker"], // accessories
    weight: 1.1, // slightly boost because “mg”/“rx” are strong signals
  },
  Technology: {
    include: [
      "laptop", "phone", "smartphone", "tablet", "camera", "headphones",
      "keyboard", "router", "monitor", "pc", "desktop", "mouse",
      "macbook", "iphone", "android", "chromebook", "charger", "power bank",
      "ssd", "gpu", "graphics card", "cpu", "motherboard", "ram", "router",
      rx.cpuGpu, rx.storage,
    ],
    exclude: ["phone case", "laptop sleeve", "keyboard tray"], // accessories if you want to treat separately
    weight: 0.95,
  },
  Unknown: {
    include: [],
  },
};

const SOURCE_HINTS: Partial<Record<Category, Token[]>> = {
  Food: ["fdc", "usda", "myfitnesspal"],
  Technology: ["bestbuy", "newegg", "microcenter"],
  Clothes: ["zara", "h&m", "uniqlo", "asos"],
  Drugs: ["drugs.com", "rxlist", "nih", "medlineplus", "pharmacy"],
};

const PRIMITIVE_RULES: Record<Primitive, Token[]> = {
  News: [
    "breaking", "headline", "reported", "coverage", "press release", "news", "announced",
    /\b(released?|launch(ed)?|unveil(ed)?)\b/i,
  ],
  PriceChangeHistory: [
    "price history", "price change", "price drop", "discount", "msrp", "deal", "sale", "camelcamelcamel",
  ],
  ArticlesEdited: [
    "revision", "edit history", "article edit", "diff", "changelog", "wiki", "wikipedia", "edited on",
  ],
};

function squash(meta: PipelineMeta): string {
  const parts = [
    meta.primaryQuery,
    ...meta.labels,
    meta.brand,
    meta.source,
    meta.locale,
    meta.description,
    ...Object.entries(meta.attributes ?? {}).map(([k, v]) => `${k}:${v}`),
  ].filter(Boolean) as string[];

  const blob = parts.join(" ").toLowerCase();
  return blob
    .replace(/[_\-]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function countMatches(blob: string, tokens: Token[]): { hits: string[]; count: number } {
  const hits: string[] = [];
  let count = 0;
  for (const t of tokens) {
    if (typeof t === "string") {
      if (blob.includes(t.toLowerCase())) {
        hits.push(t);
        count++;
      }
    } else {
      const m = blob.match(t);
      if (m) {
        hits.push(t.source);
        count += m.length > 0 ? 1 : 0;
      }
    }
  }
  return { hits, count };
}

function anyMatch(blob: string, tokens?: Token[]): string[] {
  if (!tokens || tokens.length === 0) return [];
  return tokens.flatMap(t => {
    if (typeof t === "string") return blob.includes(t.toLowerCase()) ? [t] : [];
    return t.test(blob) ? [t.source] : [];
  });
}

export class ProductClassifier {
  determineCategory(meta: PipelineMeta): CategoryDecision {
    const blob = squash(meta);

    const evidenceByCategory = Object.fromEntries(
      (Object.keys(CATEGORY_RULES) as Category[]).map((cat) => {
        const rule = CATEGORY_RULES[cat];
        const inc = countMatches(blob, rule.include);
        const exc = anyMatch(blob, rule.exclude);
        let score = inc.count;

        const hints = SOURCE_HINTS[cat];
        if (hints) score += countMatches(blob, hints).count * 0.5;

        if (rule.weight) score *= rule.weight;

        if (exc.length) score -= Math.min(1, exc.length) * 0.75;

        return [cat, { matched: inc.hits, blocked: exc, score } as CategoryEvidence];
      }),
    ) as Record<Category, CategoryEvidence>;

    const best = (Object.keys(evidenceByCategory) as Category[])
      .filter(c => c !== "Unknown")
      .map((c) => [c, evidenceByCategory[c].score] as const)
      .sort((a, b) => b[1] - a[1])[0];

    const category: Category =
      best && best[1] >= 1 ? (best[0] as Category) : "Unknown";

    return { category, evidenceByCategory };
  }

  detectPrimitives(meta: PipelineMeta): PrimitiveDecision {
    const blob = squash(meta);

    const primitives: Primitive[] = [];
    const evidence: Record<Primitive, string[]> = {
      News: [],
      PriceChangeHistory: [],
      ArticlesEdited: [],
    };

    (Object.keys(PRIMITIVE_RULES) as Primitive[]).forEach((p) => {
      const hits = anyMatch(blob, PRIMITIVE_RULES[p]);
      if (hits.length) {
        primitives.push(p);
        evidence[p] = hits;
      }
    });

    return { primitives, evidence };
  }

  routeCategory(category: Category): string[] {
    switch (category) {
      case "Food":
        return [
          "Find Nearest Location",
          "Retrieve Nutrient Information",
          "Get Price Change History",
        ];
      case "Clothes":
        return [
          "Find Nearest Location",
          "Retrieve Product Reviews",
          "Get Price Change History",
        ];
      case "Drugs":
        return [
          "Find Nearest Location",
          "Get Price Change History",
        ];
      case "Technology":
        return ["No Designated Task"];
      default:
        return [];
    }
  }

  routePrimitives(primitives: Primitive[]): string[] {
    const steps: string[] = [];
    if (primitives.includes("News")) {
      steps.push(
        "News Source Identification",
        "News Sentiment Analysis",
        "News Summarization",
      );
    }
    if (primitives.includes("PriceChangeHistory")) {
      steps.push(
        "Price Change Source Identification",
        "Price Change Trend Analysis",
        "Price Change Alert Generation",
      );
    }
    if (primitives.includes("ArticlesEdited")) {
      steps.push(
        "Article Edit Source Identification",
        "Article Edit History Analysis",
        "Article Edit Impact Assessment",
      );
    }
    return steps;
  }

  plan(meta: PipelineMeta) {
    const categoryDecision = this.determineCategory(meta);
    const primitiveDecision = this.detectPrimitives(meta);

    const categoryTasks = this.routeCategory(categoryDecision.category);
    const primitiveTasks = this.routePrimitives(primitiveDecision.primitives);

    return {
      category: categoryDecision.category,
      categoryEvidence: categoryDecision.evidenceByCategory[categoryDecision.category],
			evidenceByCategory: categoryDecision.evidenceByCategory,
      primitiveSignals: primitiveDecision.primitives,
      primitiveEvidence: primitiveDecision.evidence,
      nextSteps: {
        categoryTasks,
        primitiveTasks,
        outputTriggers: [
          ...(primitiveTasks.some(s => /Summarization|Alert Generation|Impact Assessment/.test(s))
            ? ["Output Designated Information"]
            : []),
        ],
      },
    };
  }
}

export type WebDetect = {
	webEntities: { description?: string; score?: number }[];
	fullMatchingImages: { url: string }[];
	partialMatchingImages: { url: string }[];
	pagesWithMatchingImages: { url: string; pageTitle?: string }[];
};

export type NewsHit = {
	title: string;
	url: string;
	source: string;
	publishedAt?: string;
};

export type CSEResult = {
	title: string;
	link: string;
	snippet: string;
	thumbnail?: { src: string; width: string; height: string };
};

export type YTHit = { title: string; videoId: string };

export type Nutrient = {
	id: number;
	name: string;
	unit: string;
	value: number;
};

export type FoodBlock = {
	fdcId?: number;
	description?: string;
	nutrients?: Nutrient[];
};

// Updated Insights to include detailed classifier output
export type Insights = {
	meta: PipelineMeta;
	category: Category;
	categoryEvidence?: CategoryEvidence;
	evidenceByCategory?: Record<Category, CategoryEvidence>;
	primitiveSignals?: Primitive[];
	primitiveEvidence?: Record<Primitive, string[]>;
	nextSteps?: any; // Contains planned tasks from the classifier
	news?: NewsHit[];
	cse?: CSEResult[];
	youtube?: YTHit[];
	food?: FoodBlock;
};

export type PipelineResult = {
	id: string;
	detect: WebDetect;
	insights: Insights;
	error?: string;
};

export class AIAnalysisPipeline {
	private api: {
		fdc: ReturnType<typeof createFDCClient>;
		news: typeof newsapi;
	};
	private classifier: ProductClassifier;

	constructor(foodApiKey: string) {
		this.api = {
			fdc: createFDCClient(foodApiKey),
			news: newsapi,
		};
		this.classifier = new ProductClassifier();
	}

	static async reverseImageSearch(file: File): Promise<WebDetect> {
		const fd = new FormData();
		fd.append("file", file, file.name);
		const res = await fetch("/api/google/reverse-image", { method: "POST", body: fd });
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw new Error(`Vision error: ${JSON.stringify(err)}`);
		}
		const response = await res.json() as { data: WebDetect };
		return response.data;
	}

	static async fetchNews(query: string): Promise<NewsHit[]> {
		const hits: NewsHit[] = [];
		try {
			const g = await gnewsSearch(query, { lang: "en", max: 4 });
			if (g && 'articles' in g) {
				hits.push(
					...(g.articles || []).map((a: any) => ({
						title: a.title,
						url: a.url,
						source: a.source?.name,
						publishedAt: a.publishedAt,
					})),
				);
			}
		} catch (e) {
			console.warn("GNews error", e);
		}
		if (hits.length < 2) {
			try {
				const top = await gnewsTopHeadlines({ lang: "en", max: 2 });
				if (top && 'articles' in top) {
					hits.push(
						...(top.articles || []).map((a: any) => ({
							title: a.title,
							url: a.url,
							source: a.source?.name,
							publishedAt: a.publishedAt,
						})),
					);
				}
			} catch (topErr) {
				console.warn("GNews top error", topErr);
			}
		}
		const seen = new Set<string>();
		return hits.filter((h) => h.url && !seen.has(h.url) && seen.add(h.url));
	}

	static async fetchWebResults(query: string): Promise<CSEResult[]> {
		try {
			const results = await googleSearch(query);
			if (results && 'items' in results) {
				return results.items?.slice(0, 5) || [];
			}
			return [];
		} catch (e) {
			console.warn("Google Search error", e);
			return [];
		}
	}

	static async fetchYouTubeVideos(query: string): Promise<YTHit[]> {
		try {
			const results = await youtubeSearch(query);
			if (results && 'items' in results) {
				return (
					results.items?.slice(0, 4).map((it: any) => ({
						title: it.snippet?.title || it.title,
						videoId: it.id?.videoId || it.videoId,
					})) || []
				);
			}
			return [];
		} catch (e) {
			console.warn("YouTube Search error", e);
			return [];
		}
	}

	async reverseImage(file: File): Promise<WebDetect> {
		return AIAnalysisPipeline.reverseImageSearch(file);
	}

	extractMeta(d: WebDetect): PipelineMeta {
		const labels = (d.webEntities || [])
			.map((e) => (e.description ?? "").trim())
			.filter(Boolean)
			.slice(0, 6);

		const pageTerms = (d.pagesWithMatchingImages || [])
			.flatMap((p) => (p.pageTitle ?? "").split(/[|\-–—:]/))
			.map((s) => s.trim())
			.filter(Boolean)
			.slice(0, 6);

		const primary = (labels[0] ?? pageTerms[0] ?? "").trim();
		const extra = labels[1] ?? pageTerms[1] ?? "";
		const primaryQuery = [primary, extra].filter(Boolean).join(" ");

		const description = (d.webEntities || [])
			.map((e) => e.description)
			.filter(Boolean)
			.join(", ");

		return {
			primaryQuery: primaryQuery || "product",
			labels,
			description,
			source: d.pagesWithMatchingImages?.[0]?.url.match(/https?:\/\/([^\/]+)/)?.[1] || null
		};
	}

	async getNews(meta: PipelineMeta): Promise<NewsHit[]> {
		return AIAnalysisPipeline.fetchNews(meta.primaryQuery);
	}

	async runFoodPipeline(meta: PipelineMeta): Promise<FoodBlock> {
		try {
			const found =
				(await this.api.fdc.findFood(meta.primaryQuery, ["Branded"])) ||
				(await this.api.fdc.findFood(meta.primaryQuery, ["Foundation"]));
			if (!found) return {};

			const wanted = [208, 203, 204, 205, 269, 307, 601]; // kcals, protein, fat, carbs, sugars, sodium, cholesterol
			const nutrs = await this.api.fdc.getFoodNutrients(found.fdcId, wanted);
			const nutrients: Nutrient[] = (nutrs || []).map((n: any) => ({
				id: n.nutrient.id,
				name: n.nutrient.name,
				unit: n.nutrient.unitName,
				value: n.amount,
			}));
			return { fdcId: found.fdcId, description: found.description, nutrients };
		} catch (e) {
			console.warn("FDC error", e);
			return {};
		}
	}

	async runClothesPipeline(meta: PipelineMeta) {
		const [cse, yt] = await Promise.allSettled([
			AIAnalysisPipeline.fetchWebResults(`${meta.primaryQuery} reviews`),
			AIAnalysisPipeline.fetchYouTubeVideos(`${meta.primaryQuery} review`),
		]);

		return {
			cse: cse.status === "fulfilled" ? cse.value : [],
			youtube: yt.status === "fulfilled" ? yt.value : [],
		};
	}

	async runDrugsPipeline(meta: PipelineMeta) {
		const [cse, yt] = await Promise.allSettled([
			AIAnalysisPipeline.fetchWebResults(
				`${meta.primaryQuery} dosage side effects site:drugs.com OR site:rxlist.com OR site:mayoclinic.org`,
			),
			AIAnalysisPipeline.fetchYouTubeVideos(`${meta.primaryQuery} overview`),
		]);

		return {
			cse: cse.status === "fulfilled" ? cse.value : [],
			youtube: yt.status === "fulfilled" ? yt.value : [],
		};
	}

	async runTechPipeline(meta: PipelineMeta) {
		const [cse, yt] = await Promise.allSettled([
			AIAnalysisPipeline.fetchWebResults(`${meta.primaryQuery} specs review`),
			AIAnalysisPipeline.fetchYouTubeVideos(`${meta.primaryQuery} review`),
		]);

		return {
			cse: cse.status === "fulfilled" ? cse.value : [],
			youtube: yt.status === "fulfilled" ? yt.value : [],
		};
	}

	async runPipelineForImage(imageFile: {
		id: string;
		file: File;
	}): Promise<PipelineResult> {
		const detect = await this.reverseImage(imageFile.file);
		const meta = this.extractMeta(detect);

		// Use the new, more powerful classifier
		const plan = this.classifier.plan(meta);
		const category = plan.category;

		// Fetch news (consistent with original logic, now supported by primitive detection)
		const news = await this.getNews(meta);

		let cat: Partial<Insights> = {};
		if (category === "Food") {
			const food = await this.runFoodPipeline(meta);
			cat = { food };
		} else if (category === "Clothes") {
			const { cse, youtube } = await this.runClothesPipeline(meta);
			cat = { cse, youtube };
		} else if (category === "Drugs") {
			const { cse, youtube } = await this.runDrugsPipeline(meta);
			cat = { cse, youtube };
		} else { // Covers "Technology" and "Unknown"
			const { cse, youtube } = await this.runTechPipeline(meta);
			cat = { cse, youtube };
		}

		const insights: Insights = {
			meta,
			category,
			news,
			categoryEvidence: plan.categoryEvidence,
			evidenceByCategory: plan.evidenceByCategory,
			primitiveSignals: plan.primitiveSignals,
			primitiveEvidence: plan.primitiveEvidence,
			nextSteps: plan.nextSteps,
			...cat,
		};

		return { id: imageFile.id, detect, insights };
	}
}
