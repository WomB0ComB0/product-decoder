/**
 * Copyright 2025 Mike Odnis
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

import { AbridgedFood, DataType, FDCClientConfig, Food, FoodNutrient, FoodsListResponse, FoodsOptions, ListOptions, SearchOptions, SearchResult, SortBy, SortOrder } from "@packages/shared";
import { type } from "arktype";


/**
 * Error types for better error handling
 */
export class FDCApiError extends Error {
	constructor(
		message: string,
		public status?: number,
		public response?: any,
	) {
		super(message);
		this.name = "FDCApiError";
	}
}

export class FDCRateLimitError extends FDCApiError {
	constructor(
		message = "Rate limit exceeded. API key temporarily blocked for 1 hour.",
	) {
		super(message, 429);
		this.name = "FDCRateLimitError";
	}
}

export class FDCAuthError extends FDCApiError {
	constructor(message = "Invalid API key") {
		super(message, 401);
		this.name = "FDCAuthError";
	}
}

export class FDCValidationError extends FDCApiError {
	constructor(message: string, validationError: any) {
		super(`Validation failed: ${message}`, 400, validationError);
		this.name = "FDCValidationError";
	}
}

/**
 * Main FoodData Central API Client Class with ArkType validation
 */
export class FDCClient {
	private readonly apiKey: string;
	private readonly baseUrl: string;
	private readonly timeout: number;
	private readonly retryAttempts: number;
	private readonly retryDelay: number;

	constructor(config: FDCClientConfig) {
		// Validate constructor config
		const configValidation = FDCClientConfig(config);
		if (configValidation instanceof type.errors) {
			throw new FDCValidationError(
				"Invalid client configuration",
				configValidation.summary,
			);
		}

		const validatedConfig = configValidation as FDCClientConfig;

		if (!validatedConfig.apiKey || validatedConfig.apiKey.trim() === "") {
			throw new Error("API key is required");
		}

		this.apiKey = validatedConfig.apiKey;
		this.baseUrl = validatedConfig.baseUrl || "https://api.nal.usda.gov/fdc/v1";
		this.timeout = validatedConfig.timeout || 10_000; // 10 seconds
		this.retryAttempts = validatedConfig.retryAttempts || 3;
		this.retryDelay = validatedConfig.retryDelay || 1_000; // 1 second
	}

	/**
	 * Makes HTTP requests with error handling, retries, and validation
	 */
	private async makeRequest<T>(
		endpoint: string,
		responseSchema: any,
		options: RequestInit = {},
	): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);

		const requestOptions: RequestInit = {
			...options,
			signal: controller.signal,
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				...options.headers,
			},
		};

		let lastError: Error;

		for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
			try {
				console.log(`Making request to: ${url}`);

				const response = await fetch(url, requestOptions);
				clearTimeout(timeoutId);

				if (!response.ok) {
					await this.handleHttpError(response);
				}

				const data = await response.json();
				console.log(`Raw response received:`, JSON.stringify(data, null, 2)); // Debug log

				// Validate response against schema
				const validationResult = responseSchema(data);
				if (validationResult instanceof type.errors) {
					console.warn(
						"⚠️ API response validation failed:",
						validationResult.summary,
					);
					console.warn("Raw response:", JSON.stringify(data, null, 2));
					// Continue with unvalidated data but log the issue
					return data as T;
				}

				console.log("✅ Response validation successful");
				return validationResult as T;
			} catch (error) {
				lastError = error as Error;

				// Log the error for debugging
				console.error(`Attempt ${attempt} failed:`, error);

				if (
					error instanceof FDCRateLimitError ||
					error instanceof FDCAuthError ||
					error instanceof FDCValidationError
				)
					throw error; // Don't retry on these errors

				if (attempt < this.retryAttempts) {
					await this.delay(this.retryDelay * attempt);
				}
			}
		}

		clearTimeout(timeoutId);
		throw lastError!;
	}

	/**
	 * Handle HTTP errors with appropriate error types
	 */
	private async handleHttpError(response: Response): Promise<never> {
		let responseText = "";
		try {
			responseText = await response.text();
		} catch (e) {
			responseText = `Could not read response: ${e}`;
		}

		console.error(`HTTP Error ${response.status}: ${responseText}`); // Debug log

		switch (response.status) {
			case 401:
				throw new FDCAuthError("Invalid API key");
			case 429:
				throw new FDCRateLimitError();
			case 404:
				throw new FDCApiError(
					`Resource not found. Check the endpoint URL and FDC ID.`,
					404,
					responseText,
				);
			case 400:
				throw new FDCApiError(
					`Bad request: ${responseText}`,
					400,
					responseText,
				);
			case 500:
				throw new FDCApiError(
					`Server error: ${responseText}`,
					500,
					responseText,
				);
			default:
				throw new FDCApiError(
					`HTTP ${response.status}: ${responseText}`,
					response.status,
					responseText,
				);
		}
	}

	/**
	 * Utility method for delays
	 */
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Validates FDC ID format
	 */
	private validateFdcId(fdcId: number): void {
		if (!Number.isInteger(fdcId) || fdcId <= 0) {
			throw new FDCValidationError(
				`Invalid FDC ID: ${fdcId}. Must be a positive integer.`,
				{ fdcId },
			);
		}
	}

	/**
	 * Validates array of FDC IDs
	 */
	private validateFdcIds(fdcIds: number[]): void {
		if (!Array.isArray(fdcIds) || fdcIds.length === 0) {
			throw new FDCValidationError("FDC IDs must be a non-empty array", {
				fdcIds,
			});
		}

		fdcIds.forEach((id, index) => {
			if (!Number.isInteger(id) || id <= 0) {
				throw new FDCValidationError(
					`Invalid FDC ID at index ${index}: ${id}. Must be a positive integer.`,
					{ fdcIds },
				);
			}
		});
	}

	/**
	 * Builds query parameters securely
	 */
	private buildQueryParams(params: Record<string, any>): string {
		const urlParams = new URLSearchParams();
		urlParams.set("api_key", this.apiKey);

		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				if (Array.isArray(value)) {
					value.forEach((v) => urlParams.append(key, String(v)));
				} else {
					urlParams.set(key, String(value));
				}
			}
		});

		return urlParams.toString();
	}

	/**
	 * Get details for a single food item by FDC ID
	 */
	async getFood(fdcId: number, nutrients?: number[]): Promise<Food> {
		this.validateFdcId(fdcId);

		if (nutrients !== undefined) {
			this.validateFdcIds(nutrients);
		}

		const params: Record<string, any> = {};
		if (nutrients && nutrients.length > 0) {
			params.nutrients = nutrients.join(",");
		}

		const queryString = this.buildQueryParams(params);
		const endpoint = `/food/${fdcId}?${queryString}`;

		return this.makeRequest<Food>(endpoint, Food);
	}

	/**
	 * Get details for multiple food items by FDC IDs
	 */
	async getFoods(options: FoodsOptions): Promise<Food[]> {
		const optionsValidation = FoodsOptions(options);
		if (optionsValidation instanceof type.errors) {
			throw new FDCValidationError(
				"Invalid foods options",
				optionsValidation.summary,
			);
		}

		const validatedOptions = optionsValidation as FoodsOptions;

		if (validatedOptions.fdcIds.length === 0) {
			throw new FDCValidationError("At least one FDC ID is required", {
				fdcIds: validatedOptions.fdcIds,
			});
		}

		if (validatedOptions.fdcIds.length > 20) {
			throw new FDCValidationError("Maximum 20 FDC IDs allowed per request", {
				count: validatedOptions.fdcIds.length,
			});
		}

		this.validateFdcIds(validatedOptions.fdcIds);

		if (validatedOptions.nutrients) {
			this.validateFdcIds(validatedOptions.nutrients);
		}

		const body = {
			fdcIds: validatedOptions.fdcIds,
			format: validatedOptions.format || "full",
			...(validatedOptions.nutrients && {
				nutrients: validatedOptions.nutrients,
			}),
		};

		const queryString = this.buildQueryParams({});
		const endpoint = `/foods?${queryString}`;

		return this.makeRequest<Food[]>(endpoint, Food.array(), {
			method: "POST",
			body: JSON.stringify(body),
		});
	}

	/**
	 * Get a paginated list of foods
	 */
	async getFoodsList(
		options: ListOptions = {},
	): Promise<FoodsListResponse | null> {
		const optionsValidation = ListOptions(options);
		if (optionsValidation instanceof type.errors) {
			throw new FDCValidationError(
				"Invalid list options",
				optionsValidation.summary,
			);
		}

		const validatedOptions = optionsValidation as ListOptions;

		try {
			const params: Record<string, any> = {
				pageSize: Math.min(validatedOptions.pageSize || 50, 200), // Max 200 per API docs
				pageNumber: Math.max(validatedOptions.pageNumber || 1, 1),
				sortBy: validatedOptions.sortBy || "fdcId",
				sortOrder: validatedOptions.sortOrder || "asc",
			};

			if (validatedOptions.dataType && validatedOptions.dataType.length > 0) {
				params.dataType = validatedOptions.dataType;
			}

			const queryString = this.buildQueryParams(params);
			const endpoint = `/foods/list?${queryString}`;

			return await this.makeRequest<FoodsListResponse>(
				endpoint,
				FoodsListResponse,
			);
		} catch (error) {
			if (error instanceof FDCApiError && error.status === 404) {
				console.warn(
					"getFoodsList: /foods/list endpoint not available. Use searchFoods instead.",
				);
				return null;
			}
			throw error;
		}
	}

	/**
	 * Search for foods matching query criteria
	 */
	async searchFoods(options: SearchOptions): Promise<SearchResult> {
		// Validate input options
		const optionsValidation = SearchOptions(options);
		if (optionsValidation instanceof type.errors) {
			throw new FDCValidationError(
				"Invalid search options",
				optionsValidation.summary,
			);
		}

		const validatedOptions = optionsValidation as SearchOptions;

		if (!validatedOptions.query || validatedOptions.query.trim() === "") {
			throw new FDCValidationError("Search query is required", {
				query: validatedOptions.query,
			});
		}

		const body: Record<string, any> = {
			query: validatedOptions.query.trim(),
			pageSize: Math.min(validatedOptions.pageSize || 50, 200), // Max 200 per API docs
			pageNumber: Math.max(validatedOptions.pageNumber || 1, 1),
			sortBy: validatedOptions.sortBy || "dataType.keyword",
			sortOrder: validatedOptions.sortOrder || "asc",
		};

		// Only add optional parameters if they're specified
		if (validatedOptions.dataType && validatedOptions.dataType.length > 0) {
			body.dataType = validatedOptions.dataType;
		}

		if (validatedOptions.brandOwner) {
			body.brandOwner = validatedOptions.brandOwner;
		}

		const queryString = this.buildQueryParams({});
		const endpoint = `/foods/search?${queryString}`;

		return this.makeRequest<SearchResult>(endpoint, SearchResult, {
			method: "POST",
			body: JSON.stringify(body),
		});
	}

	/**
	 * Get nutrient information for a food item (convenience method)
	 */
	async getFoodNutrients(
		fdcId: number,
		nutrientIds?: number[],
	): Promise<FoodNutrient[]> {
		const food = await this.getFood(fdcId, nutrientIds);
		return food.foodNutrients;
	}

	/**
	 * Search for a specific food and return the first match (convenience method)
	 */
	async findFood(
		query: string,
		dataType?: DataType[],
	): Promise<AbridgedFood | null> {
		if (typeof query !== "string" || query.trim() === "") {
			throw new FDCValidationError("Query must be a non-empty string", {
				query,
			});
		}

		if (dataType) {
			for (const dt of dataType) {
				const dtValidation = DataType(dt);
				if (dtValidation instanceof type.errors) {
					throw new FDCValidationError(
						`Invalid data type: ${dt}`,
						dtValidation.summary,
					);
				}
			}
		}

		const results = await this.searchFoods({
			query,
			dataType,
			pageSize: 1,
			pageNumber: 1,
		});

		return results.foods.length > 0 ? results.foods[0] : null;
	}

	/**
	 * Alternative to getFoodsList using search with wildcard
	 */
	async getFoodsListAlternative(
		options: ListOptions = {},
	): Promise<SearchResult> {
		const optionsValidation = ListOptions(options);
		if (optionsValidation instanceof type.errors) {
			throw new FDCValidationError(
				"Invalid list options for alternative method",
				optionsValidation.summary,
			);
		}

		const validatedOptions = optionsValidation as ListOptions;

		const searchOptions: SearchOptions = {
			query: "*",
			dataType: validatedOptions.dataType,
			pageSize: validatedOptions.pageSize || 50,
			pageNumber: validatedOptions.pageNumber || 1,
			sortBy: (validatedOptions.sortBy as any) || "dataType.keyword",
			sortOrder: validatedOptions.sortOrder || "asc",
		};

		return this.searchFoods(searchOptions);
	}
}

/**
 * Factory function for creating FDC client instances with validation
 */
export function createFDCClient(
	apiKey: string,
	config?: Partial<FDCClientConfig>,
): FDCClient {
	if (typeof apiKey !== "string" || apiKey.trim() === "") {
		throw new FDCValidationError("API key must be a non-empty string", {
			apiKey,
		});
	}

	const fullConfig: FDCClientConfig = {
		apiKey,
		...config,
	};

	return new FDCClient(fullConfig);
}
