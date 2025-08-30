/**
 * Copyright 2025 Product Decoder
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

// MediaStack News API - https://api.mediastack.com/v1
import { type } from "arktype";

const PaginationInfo = type({
	limit: "number",
	offset: "number",
	count: "number",
	total: "number",
});

const NewsArticle = type({
	author: "string | null",
	title: "string",
	description: "string | null",
	url: "string",
	source: "string",
	image: "string | null",
	category: "string",
	language: "string",
	country: "string",
	published_at: "string",
});

const NewsSource = type({
	id: "string",
	name: "string",
	category: "string",
	country: "string",
	language: "string",
	url: "string",
});

const NewsResponse = type({
	pagination: PaginationInfo,
	data: NewsArticle.array(),
});

const MediaStackSourcesResponse = type({
	pagination: PaginationInfo,
	data: NewsSource.array(),
});

const APIError = type({
	error: {
		code: "string",
		message: "string",
		"context?": "Record<string, string[]>",
	},
});

const NewsCategory = type(
	"'general' | 'business' | 'entertainment' | 'health' | 'science' | 'sports' | 'technology'",
);

const SortOption = type("'published_desc' | 'popularity'");

const NewsRequestParams = type({
	"sources?": "string",
	"categories?": "string",
	"countries?": "string",
	"languages?": "string",
	"keywords?": "string",
	"date?": "string",
	"sort?": SortOption,
	"limit?": "number",
	"offset?": "number",
});

const SourcesRequestParams = type({
	"search?": "string",
	"countries?": "string",
	"languages?": "string",
	"categories?": "string",
	"limit?": "number",
	"offset?": "number",
});

const ConstructorOptions = type({
	"minRequestInterval?": "number",
	"maxRequestsPerMinute?": "number",
	"isFreePlan?": "boolean",
});

export type PaginationInfo = typeof PaginationInfo.infer;
export type NewsArticle = typeof NewsArticle.infer;
export type NewsSource = typeof NewsSource.infer;
export type NewsResponse = typeof NewsResponse.infer;
export type MediaStackSourcesResponse = typeof MediaStackSourcesResponse.infer;
export type APIError = typeof APIError.infer;
export type NewsCategory = typeof NewsCategory.infer;
export type SortOption = typeof SortOption.infer;
export type NewsRequestParams = typeof NewsRequestParams.infer;
export type SourcesRequestParams = typeof SourcesRequestParams.infer;
export type ConstructorOptions = typeof ConstructorOptions.infer;

// USDA Food Data Central API - https://api.nal.usda.gov/fdc/v1
const FoodNutrientDerivation = type({
	id: "number",
	code: "string",
	description: "string",
});

const Nutrient = type({
	id: "number",
	number: "string",
	name: "string",
	rank: "number",
	unitName: "string",
});

const FoodNutrient = type({
	id: "number",
	amount: "number",
	nutrient: Nutrient,
	"foodNutrientDerivation?": FoodNutrientDerivation,
});

const FoodAttribute = type({
	id: "number",
	sequenceNumber: "number",
	value: "string",
});

const Food = type({
	fdcId: "number",
	description: "string",
	dataType: "string",
	publicationDate: "string",
	"brandOwner?": "string",
	"brandName?": "string",
	"ingredients?": "string",
	"marketCountry?": "string",
	"foodCategory?": "string",
	"modifiedDate?": "string",
	"dataSource?": "string",
	"packageWeight?": "string",
	"servingSizeUnit?": "string",
	"servingSize?": "number",
	"householdServingFullText?": "string",
	foodNutrients: FoodNutrient.array(),
	"foodAttributes?": FoodAttribute.array(),
});

const AbridgedFoodNutrient = type({
	nutrientId: "number",
	nutrientName: "string",
	nutrientNumber: "string",
	unitName: "string",
	value: "number",
});

const AbridgedFood = type({
	fdcId: "number",
	description: "string",
	dataType: "string",
	publicationDate: "string",
	"brandOwner?": "string",
	"gtinUpc?": "string",
	"brandName?": "string",
	"ingredients?": "string",
	"marketCountry?": "string",
	"foodCategory?": "string",
	"modifiedDate?": "string",
	"dataSource?": "string",
	"packageWeight?": "string",
	"servingSizeUnit?": "string",
	"servingSize?": "number",
	"householdServingFullText?": "string",
	"shortDescription?": "string",
	"tradeChannels?": "string[]",
	"allHighlightFields?": "string",
	"score?": "number",
	"microbes?": "unknown[]",
	foodNutrients: AbridgedFoodNutrient.array(),
});

const SearchCriteria = type({
	query: "string",
	dataType: "string[]",
	pageSize: "number",
	pageNumber: "number",
	sortBy: "string",
	sortOrder: "string",
});

const SearchAggregations = type({
	"dataType?": "Record<string, number>",
	"nutrients?": "Record<string, unknown>",
});

const SearchResult = type({
	totalHits: "number",
	currentPage: "number",
	totalPages: "number",
	pageList: "number[]",
	foods: AbridgedFood.array(),
	criteria: SearchCriteria,
	"aggregations?": SearchAggregations,
});

const FoodsListResponse = type({
	currentPage: "number",
	totalHits: "number",
	totalPages: "number",
	foods: AbridgedFood.array(),
});

const DataType = type(
	"'Branded' | 'Foundation' | 'Survey' | 'Legacy' | 'Survey (FNDDS)' | 'SR Legacy'",
);

const SortBy = type(
	"'dataType.keyword' | 'lowercaseDescription.keyword' | 'fdcId' | 'publishedDate'",
);

const SortOrder = type("'asc' | 'desc'");

const SearchOptions = type({
	query: "string",
	"dataType?": DataType.array(),
	"pageSize?": "number",
	"pageNumber?": "number",
	"sortBy?": SortBy,
	"sortOrder?": SortOrder,
	"brandOwner?": "string",
});

const ListOptions = type({
	"dataType?": DataType.array(),
	"pageSize?": "number",
	"pageNumber?": "number",
	"sortBy?": SortBy,
	"sortOrder?": SortOrder,
});

const FoodsOptions = type({
	fdcIds: "number[]",
	"format?": "'abridged' | 'full'",
	"nutrients?": "number[]",
});

const FDCClientConfig = type({
	apiKey: "string",
	"baseUrl?": "string",
	"timeout?": "number",
	"retryAttempts?": "number",
	"retryDelay?": "number",
});

export type FoodNutrientDerivation = typeof FoodNutrientDerivation.infer;
export type Nutrient = typeof Nutrient.infer;
export type FoodNutrient = typeof FoodNutrient.infer;
export type FoodAttribute = typeof FoodAttribute.infer;
export type Food = typeof Food.infer;
export type AbridgedFoodNutrient = typeof AbridgedFoodNutrient.infer;
export type AbridgedFood = typeof AbridgedFood.infer;
export type SearchCriteria = typeof SearchCriteria.infer;
export type SearchAggregations = typeof SearchAggregations.infer;
export type SearchResult = typeof SearchResult.infer;
export type FoodsListResponse = typeof FoodsListResponse.infer;
export type DataType = typeof DataType.infer;
export type SortBy = typeof SortBy.infer;
export type SortOrder = typeof SortOrder.infer;
export type SearchOptions = typeof SearchOptions.infer;
export type ListOptions = typeof ListOptions.infer;
export type FoodsOptions = typeof FoodsOptions.infer;
export type FDCClientConfig = typeof FDCClientConfig.infer;

// GNews API - https://gnews.io/api/v4

const GNewsArticle = type({
	title: "string",
	description: "string",
	content: "string",
	url: "string",
	image: "string",
	publishedAt: "string",
	lang: "string",
	source: {
		id: "string",
		name: "string",
		url: "string",
		country: "string",
	},
});

export const GNewsResponse = type({
	totalArticles: "number",
	articles: [GNewsArticle, "[]"],
});

const GNewsError = type({
	errors: "string[]",
});

export type TGNewsArticle = typeof GNewsArticle.infer;
export type TGNewsResponse = typeof GNewsResponse.infer;
export type TGNewsError = typeof GNewsError.infer;

// NewsAPI - https://newsapi.org/

const NewsAPIArticle = type({
	source: {
		id: "string|null",
		name: "string",
	},
	author: "string|null",
	title: "string",
	description: "string|null",
	url: "string.url",
	"urlToImage?": "string.url|null",
	publishedAt: "string",
	content: "string|null",
});

const NewsAPISource = type({
	id: "string",
	name: "string",
	description: "string",
	url: "string.url",
	category: "string",
	language: "string",
	country: "string",
});

const NewsAPIArticleResponse = type({
	status: "'ok'",
	totalResults: "number",
	articles: [NewsAPIArticle, "[]"],
});

const NewsAPISourcesResponse = type({
	status: "'ok'",
	sources: [NewsAPISource, "[]"],
});

const NewsAPIResponse = NewsAPIArticleResponse.or(NewsAPISourcesResponse);

export type NewsAPIArticle = typeof NewsAPIArticle.infer;
export type NewsAPIArticleResponse = typeof NewsAPIArticleResponse.infer;
export type NewsAPISourcesResponse = typeof NewsAPISourcesResponse.infer;
export type NewsAPIResponse = typeof NewsAPIResponse.infer;

export interface TopHeadlinesParams {
	sources?: string;
	q?: string;
	category?:
		| "business"
		| "entertainment"
		| "general"
		| "health"
		| "science"
		| "sports"
		| "technology";
	language?: string;
	country?: string;
	pageSize?: number;
}

export interface EverythingParams {
	q?: string;
	sources?: string;
	domains?: string;
	excludeDomains?: string;
	from?: string;
	to?: string;
	language?: string;
	sortBy?: "relevancy" | "popularity" | "publishedAt";
	pageSize?: number;
	page?: number;
}

export interface SourcesParams {
	category?:
		| "business"
		| "entertainment"
		| "general"
		| "health"
		| "science"
		| "sports"
		| "technology";
	language?: string;
	country?: string;
}

// Google Custom Search API - https://customsearch.googleapis.com/customsearch/v1

export const RawCse = type({
	"searchInformation?": {
		"totalResults?": "string",
		"searchTime?": "number",
		"formattedTotalResults?": "string",
		"formattedSearchTime?": "string",
	},
	"items?": [
		{
			"link?": "string",
			"title?": "string",
			"snippet?": "string",
			"pagemap?": {
				"cse_thumbnail?": [
					{
						"src?": "string",
						"width?": "string | number",
						"height?": "string | number",
					},
					"[]",
				],
			},
		},
		"[]",
	],
});

export const SearchRecommendation = type({
	info: {
		totalResults: "string",
		searchTime: "number",
		formattedTotalResults: "string",
		formattedSearchTime: "string",
	},
	items: [
		{
			link: "string",
			title: "string",
			snippet: "string",
			"thumbnail?": { src: "string", width: "string", height: "string" },
		},
		"[]",
	],
});

export type TRawCse = typeof RawCse.infer;
export type TSearchRecommendation = typeof SearchRecommendation.infer;

export type SearchParams = {
	q: string;
	num?: number;
	start?: number;
	safe?: "off" | "active";
	lr?: string;
	siteSearch?: string;
	fields?: string;
};

// YouTube Data API - https://www.googleapis.com/youtube/v3/search

const ThumbnailDetail = type({
	url: "string.url",
	width: "number",
	height: "number",
});

const Thumbnails = type({
	default: ThumbnailDetail,
	medium: ThumbnailDetail,
	high: ThumbnailDetail,
});

const Snippet = type({
	publishedAt: "string",
	channelId: "string",
	title: "string",
	description: "string",
	thumbnails: Thumbnails,
	channelTitle: "string",
	liveBroadcastContent: "string",
});

const SearchResultId = type({
	kind: "string",
	videoId: "string",
});

const SearchResultItem = type({
	kind: "'youtube#searchResult'",
	etag: "string",
	id: SearchResultId,
	snippet: Snippet,
});

const PageInfo = type({
	totalResults: "number",
	resultsPerPage: "number",
});

export const YoutubeSearchResponse = type({
	kind: "'youtube#searchListResponse'",
	etag: "string",
	"nextPageToken?": "string",
	"prevPageToken?": "string",
	regionCode: "string",
	pageInfo: PageInfo,
	items: [SearchResultItem, "[]"],
});

export type YoutubeSearchResponse = typeof YoutubeSearchResponse.infer;

export const GNewsResponseSchema = GNewsResponse;
export const SearchRecommendationSchema = SearchRecommendation;
export const YoutubeSearchResponseSchema = YoutubeSearchResponse;
export const NewsResponseSchema = NewsResponse;
export const MediaStackSourcesResponseSchema = MediaStackSourcesResponse;
export const APIErrorSchema = APIError;
export const NewsRequestParamsSchema = NewsRequestParams;
export const SourcesRequestParamsSchema = SourcesRequestParams;
export const ConstructorOptionsSchema = ConstructorOptions;
export const FoodSchema = Food;
export const SearchResultSchema = SearchResult;
export const FoodsListResponseSchema = FoodsListResponse;
export const SearchOptionsSchema = SearchOptions;
export const ListOptionsSchema = ListOptions;
export const FoodsOptionsSchema = FoodsOptions;
export const FDCClientConfigSchema = FDCClientConfig;
export const NewsCategorySchema = NewsCategory;
export const DataTypeSchema = DataType;
