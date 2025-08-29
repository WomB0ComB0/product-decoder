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

import { FetchHttpClient } from "@effect/platform";
import { Effect, pipe } from "effect";
import { get, post } from "@packages/shared";
import {
	GNewsResponseSchema,
	SearchRecommendationSchema,
	YoutubeSearchResponseSchema
} from "@packages/shared";

const BASE_API_URL = process.env.BASE_URL || "http://localhost:3000/api/v1"

// GNews: search
export async function gnewsSearch(
	q: string,
	opts?: { lang?: string; max?: number },
) {
	const effect = pipe(
		get(
			`${BASE_API_URL}/gnews/search`,
			{ schema: GNewsResponseSchema },
			{ q, lang: opts?.lang ?? "en", max: opts?.max ?? 5 },
		),
		Effect.provide(FetchHttpClient.layer),
	);
	const res = await Effect.runPromise(effect);
	if (!res) throw new Error("Invalid GNews response");
	return res;
}

// GNews: top headlines
export async function gnewsTopHeadlines(opts?: {
	lang?: string;
	country?: string;
	category?:
		| "technology"
		| "general"
		| "world"
		| "nation"
		| "business"
		| "entertainment"
		| "sports"
		| "science"
		| "health";
	max?: number;
}) {
	const effect = pipe(
		get(
			`${BASE_API_URL}/gnews/top-headlines`,
			{ schema: GNewsResponseSchema },
			opts ?? {},
		),
		Effect.provide(FetchHttpClient.layer),
	);
	return Effect.runPromise(effect);
}

// Google CSE: returns your trimmed DTO (SearchRecommendation)
export async function googleSearch(q: string) {
	const effect = pipe(
		get(
			`${BASE_API_URL}/google/cse`,
			{ schema: SearchRecommendationSchema },
			{ q, num: 10 },
		),
		Effect.provide(FetchHttpClient.layer),
	);
	const res = await Effect.runPromise(effect);
	if (!res) throw new Error("Invalid CSE response");
	return res;
}

// YouTube search
export async function youtubeSearch(q: string, pageToken?: string) {
	const effect = pipe(
		get(
			`${BASE_API_URL}/google/youtube/search`,
			{ schema: YoutubeSearchResponseSchema },
			{ q, pageToken, maxResults: 10 },
		),
		Effect.provide(FetchHttpClient.layer),
	);
	const res = await Effect.runPromise(effect);
	if (!res) throw new Error("Invalid YouTube response");
	return res;
}

// Reverse image search function (new addition based on your API)
export async function reverseImageSearch(imageFile: File) {
	const formData = new FormData();
	formData.append('file', imageFile);

	const effect = pipe(
    post(`${BASE_API_URL}/google/reverse-image`, { body: formData }),
		Effect.provide(FetchHttpClient.layer),
  );

	const res = await Effect.runPromise(effect);

	if (!res) {
		throw new Error(`Reverse image search failed`);
	}

	return res;
}
