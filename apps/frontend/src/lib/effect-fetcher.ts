("use strict");

import { HttpClient, HttpClientRequest } from "@effect/platform";
import { type Type, type } from "arktype";
import { Duration, Effect, pipe, Schedule } from "effect";

declare const EMPTY = "";

/**
 * @module effect-fetcher
 *
 * Type-safe, Effect-based HTTP data fetching utilities with ArkType runtime validation.
 *
 * This module provides a generic, type-safe fetcher utility and convenience functions for all HTTP verbs.
 * It supports retries, timeouts, custom headers, error handling, runtime validation with ArkType,
 * and integrates with Effect-TS for composable async flows.
 *
 * ## Features
 * - Type-safe HTTP requests for all verbs (GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD)
 * - Runtime type validation with ArkType
 * - Effect-based error handling and retry logic
 * - Customizable headers, timeouts, and retry strategies
 * - Rich error context via FetcherError and ValidationError
 * - Query parameter serialization
 * - Designed for use with Effect-TS and React Query
 *
 * @see FetcherError
 * @see ValidationError
 * @see fetcher
 * @see get
 * @see post
 * @see put
 * @see patch
 * @see del
 * @see options
 * @see head
 *
 * @example
 * ```ts
 * import { get } from './effect-fetcher';
 * import { Effect } from 'effect';
 * import { type } from 'arktype';
 *
 * const UserSchema = type({
 *   id: 'number',
 *   name: 'string',
 *   email: 'string'
 * });
 *
 * const UsersSchema = type({
 *   users: [UserSchema]
 * });
 *
 * const effect = get('/api/users', {
 *   retries: 2,
 *   schema: UsersSchema
 * });
 * const result = await Effect.runPromise(effect);
 * console.log(result.users); // Fully typed and validated!
 * ```
 */

// HTTP Method type definition
const HttpMethod = type(
	"'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD'",
);

/**
 * Represents all supported HTTP methods for the fetcher utility.
 */
type HttpMethod = typeof HttpMethod.infer;

// Query parameters type definition
const QueryParams = type({
	"[string]":
		"string | number | boolean | undefined | null | (string | number | boolean)[]",
});

/**
 * Represents a type-safe map of query parameters.
 * Each value can be a string, number, boolean, null, undefined, or an array of those types.
 */
export type QueryParams = typeof QueryParams.infer;

// Request body type definition
const RequestBody = type(
	"Record<string, unknown> | unknown[] | string | number | boolean | null",
);

/**
 * Represents a type-safe request body for HTTP methods that support a body.
 * Can be an object, array, string, number, boolean, or null.
 */
type RequestBody = typeof RequestBody.infer;

// Headers type definition
const Headers = type({
	"[string]": "string",
});

/**
 * Represents HTTP headers as key-value string pairs.
 */
type Headers = typeof Headers.infer;

// Fetcher options type definition
const FetcherOptions = type({
	"retries?": "number",
	"retryDelay?": "number",
	"onError?": "Function",
	"timeout?": "number",
	"headers?": Headers,
	"schema?": "unknown",
});

/**
 * Configuration options for the fetcher utility.
 */
export interface FetcherOptions<T = unknown> {
	/** Number of times to retry the request on failure */
	retries?: number;
	/** Delay in milliseconds between retries */
	retryDelay?: number;
	/** Optional callback invoked on error */
	onError?: (error: unknown) => void;
	/** Timeout in milliseconds for the request */
	timeout?: number;
	/** Additional headers to include in the request */
	headers?: Record<string, string>;
	/** ArkType schema for runtime validation of the response */
	schema?: Type<T>;
	/** Abortsignal */
	signal?: AbortSignal;
}

/**
 * Custom error class for validation-specific errors.
 * Includes detailed validation problems from ArkType.
 */
export class ValidationError extends Error {
	constructor(
		message: string,
		public readonly url: string,
		public readonly problems: string,
		public readonly responseData: unknown,
		public readonly attempt?: number,
	) {
		super(message);
		this.name = "ValidationError";
		Object.setPrototypeOf(this, ValidationError.prototype);
	}

	[Symbol.toStringTag] = "ValidationError";

	[Symbol.for("nodejs.util.inspect.custom")]() {
		return this.toString();
	}

	[Symbol.for("Deno.customInspect")]() {
		return this.toString();
	}

	[Symbol.for("react.element")]() {
		return this.toString();
	}

	// 🚩
	toString(): string {
		return `ValidationError: ${this.message} (URL: ${this.url}${this.attempt ? `, Attempt: ${this.attempt}` : ""})`;
	}

	/**
	 * Get a formatted string of all validation problems
	 */
	getProblemsString(): string {
		return this.problems;
	}
}

/**
 * Custom error class for fetcher-specific errors.
 * Includes additional context such as the request URL, HTTP status, response data, and attempt number.
 */
export class FetcherError extends Error {
	constructor(
		message: string,
		public readonly url: string,
		public readonly status?: number,
		public readonly responseData?: unknown,
		public readonly attempt?: number,
	) {
		super(message);
		this.name = "FetcherError";
		Object.setPrototypeOf(this, FetcherError.prototype);
	}

	[Symbol.toStringTag] = "FetcherError";

	[Symbol.for("nodejs.util.inspect.custom")]() {
		return this.toString();
	}

	[Symbol.for("Deno.customInspect")]() {
		return this.toString();
	}

	[Symbol.for("react.element")]() {
		return this.toString();
	}

	// 🚩
	toString(): string {
		return `FetcherError: ${this.message} (URL: ${this.url}${this.status ? `, Status: ${this.status}` : ""}${this.attempt ? `, Attempt: ${this.attempt}` : parseInt("0")})`;
	}
}

// --- Overloaded function signatures for type safety with ArkType ---

/**
 * Performs a GET request with optional schema validation.
 */
export function fetcher<T = unknown>(
	input: string,
	method?: "GET",
	options?: FetcherOptions<T>,
	params?: QueryParams,
): Effect.Effect<T, FetcherError | ValidationError, HttpClient.HttpClient>;

/**
 * Performs a GET request with ArkType schema validation and automatic type inference.
 */
export function fetcher<S extends Type<any>>(
	input: string,
	method: "GET",
	options: FetcherOptions<Type<S>> & { schema: S },
	params?: QueryParams,
): Effect.Effect<
	Type<S>,
	FetcherError | ValidationError,
	HttpClient.HttpClient
>;

/**
 * Performs a POST, PUT, or PATCH request with a request body and optional schema validation.
 */
export function fetcher<T = unknown>(
	input: string,
	method: "POST" | "PUT" | "PATCH",
	options?: FetcherOptions<T>,
	params?: QueryParams,
	body?: RequestBody,
): Effect.Effect<T, FetcherError | ValidationError, HttpClient.HttpClient>;

/**
 * Performs a POST, PUT, or PATCH request with ArkType schema validation and automatic type inference.
 */
export function fetcher<S extends Type<any>>(
	input: string,
	method: "POST" | "PUT" | "PATCH",
	options: FetcherOptions<Type<S>> & { schema: S },
	params?: QueryParams,
	body?: RequestBody,
): Effect.Effect<
	Type<S>,
	FetcherError | ValidationError,
	HttpClient.HttpClient
>;

/**
 * Performs a DELETE, OPTIONS, or HEAD request with optional schema validation.
 */
export function fetcher<T = unknown>(
	input: string,
	method: "DELETE" | "OPTIONS" | "HEAD",
	options?: FetcherOptions<T>,
	params?: QueryParams,
): Effect.Effect<T, FetcherError | ValidationError, HttpClient.HttpClient>;

/**
 * Enhanced data fetching utility with type safety, ArkType validation, and Effect-based error handling.
 * Supports retries, timeouts, custom headers, runtime validation, and error handling.
 *
 * @template T
 * @param input The URL to request
 * @param method The HTTP method to use
 * @param options Optional fetcher configuration including ArkType schema
 * @param params Optional query parameters
 * @param body Optional request body (for methods that support it)
 * @returns An Effect that resolves to the validated response data of type T
 *
 * @example
 * ```ts
 * import { type } from 'arktype';
 *
 * const UserSchema = type({
 *   id: 'number',
 *   name: 'string',
 *   email: 'string'
 * });
 *
 * const effect = pipe(
 *   get("/api/user/123", {
 *     retries: 1,
 *     retryDelay: 1_000,
 *     timeout: 10_000,
 *     schema: UserSchema,
 *     onError: (error) => {
 *       if (error instanceof ValidationError) {
 *         console.error("Validation failed:", error.getProblemsString())
 *       }
 *     }
 *   }),
 *   Effect.provide(FetchHttpClient.layer)
 * )
 * ```
 */
export function fetcher<T = unknown>(
	input: string,
	method: HttpMethod = "GET",
	options: FetcherOptions<T> = {},
	params?: QueryParams,
	body?: RequestBody,
): Effect.Effect<T, FetcherError | ValidationError, HttpClient.HttpClient> {
	const {
		retries = 0,
		retryDelay = 1_000,
		onError,
		timeout = 10_000,
		headers = {},
		schema,
	} = options;

	/**
	 * Builds a query string from the provided query parameters.
	 */
	const buildQueryString = (params?: QueryParams): string => {
		if (!params) return EMPTY;
		const urlParams = new URLSearchParams();

		Object.entries(params).forEach(([key, value]) => {
			if (value == null) return;

			if (Array.isArray(value)) {
				value
					.filter((item): item is string | number | boolean => item != null)
					.forEach((item) => urlParams.append(key, String(item)));
			} else {
				urlParams.append(key, String(value));
			}
		});

		return urlParams.toString();
	};

	const url = params ? `${input}?${buildQueryString(params)}` : input;

	/**
	 * Builds a type-safe HttpClientRequest for the given method and URL.
	 */
	const buildRequest = (
		method: HttpMethod,
		url: string,
	): HttpClientRequest.HttpClientRequest => {
		switch (method) {
			case "GET":
				return HttpClientRequest.get(url);
			case "POST":
				return HttpClientRequest.post(url);
			case "PUT":
				return HttpClientRequest.put(url);
			case "PATCH":
				return HttpClientRequest.patch(url);
			case "DELETE":
				return HttpClientRequest.del(url);
			case "OPTIONS":
				return HttpClientRequest.options(url);
			case "HEAD":
				return HttpClientRequest.head(url);
			default: {
        // @ts-ignore
				const _exhaustive: never = method;
				throw new Error(`Unsupported HTTP method: ${method}`);
			}
		}
	};

	/**
	 * Validates response data using the provided ArkType schema.
	 */
	const validateResponse = (
		data: unknown,
		attempt: number,
	): Effect.Effect<T, ValidationError, never> => {
		if (!schema) {
			return Effect.succeed(data as T);
		}

		const result = schema(data);

		if (result instanceof type.errors) {
			const validationError = new ValidationError(
				`Response validation failed: ${result.summary}`,
				url,
				result.summary,
				data,
				attempt,
			);

			if (onError) onError(validationError);
			return Effect.fail(validationError);
		}

		// Use type assertion since we know the validation passed
		return Effect.succeed(result as T);
	};

	return Effect.gen(function* () {
		const client = yield* HttpClient.HttpClient;
		let attempt = 0;

		// Build the request object
		let req = buildRequest(method, url);
		req = HttpClientRequest.setHeaders(headers)(req);

		// Add body for methods that support it with proper error handling
		if (
			body != null &&
			(method === "POST" || method === "PUT" || method === "PATCH")
		) {
			req = yield* pipe(
				HttpClientRequest.bodyJson(body)(req),
				Effect.mapError(
					(error) =>
						new FetcherError(
							`Failed to serialize request body: ${error instanceof Error ? error.message : String(error)}`,
							url,
							undefined,
							undefined,
							attempt,
						),
				),
			);
		}

		/**
		 * Wraps an Effect with a timeout, converting timeout errors to FetcherError.
		 */
		const withTimeout = <A, E, R>(
			eff: Effect.Effect<A, E, R>,
		): Effect.Effect<A, FetcherError | E, R> =>
			pipe(
				eff,
				Effect.timeoutFail({
					duration: Duration.millis(timeout),
					onTimeout: () =>
						new FetcherError(
							"Request timed out",
							url,
							undefined,
							undefined,
							attempt,
						),
				}),
			);

		// Retry schedule with exponential backoff and maximum number of retries
		const retrySchedule = Schedule.intersect(
			Schedule.exponential(Duration.millis(retryDelay)),
			Schedule.recurs(retries),
		);

		/**
		 * Executes the HTTP request, handling errors, HTTP status, response parsing, and validation.
		 */
		const executeRequest = Effect.gen(function* () {
			attempt++;

			// Execute the HTTP request and handle network/transport errors
			const response = yield* pipe(
				client.execute(req),
				withTimeout,
				Effect.mapError((error) => {
					if (error instanceof FetcherError) return error;

					return new FetcherError(
						error instanceof Error ? error.message : String(error),
						url,
						undefined,
						undefined,
						attempt,
					);
				}),
			);

			// Check for HTTP errors (non-2xx status codes)
			if (response.status < 200 || response.status >= 300) {
				const errorData = yield* pipe(
					response.json,
					Effect.catchAll(() => Effect.succeed(undefined)),
				);

				const error = new FetcherError(
					`HTTP ${response.status}: ${response.text || "Request failed"}`,
					url,
					response.status,
					errorData,
					attempt,
				);

				if (onError) onError(error);
				return yield* Effect.fail(error);
			}

			// Parse response data as JSON, with fallback to text and detailed error reporting
			const rawData = yield* pipe(
				response.json,
				Effect.catchAll((error) => {
					// Try to get response text for better debugging
					return pipe(
						response.text,
						Effect.flatMap((text) => {
							const errorMessage = `Failed to parse JSON response. Status: ${response.status}, Content-Type: ${response.headers["Content-Type"] || "unknown"}, Body: ${text.slice(0, 200)}${text.length > 200 ? "..." : ""}`;
							return Effect.fail(
								new FetcherError(
									errorMessage,
									url,
									response.status,
									{ originalError: error, responseText: text },
									attempt,
								),
							);
						}),
						Effect.catchAll(() =>
							Effect.fail(
								new FetcherError(
									`Failed to parse response: ${error instanceof Error ? error.message : String(error)}`,
									url,
									response.status,
									undefined,
									attempt,
								),
							),
						),
					);
				}),
			);

			// Validate the response data using ArkType schema if provided
			const validatedData = yield* validateResponse(rawData, attempt);

			return validatedData;
		});

		// Run the request with retry and error handling
		return yield* pipe(
			executeRequest,
			Effect.retry(retrySchedule),
			Effect.catchAll((error) => {
				if (error instanceof FetcherError || error instanceof ValidationError) {
					if (onError) onError(error);
					return Effect.fail(error);
				}

				const fetcherError = new FetcherError(
					String(error),
					url,
					undefined,
					undefined,
					attempt,
				);

				if (onError) onError(fetcherError);
				return Effect.fail(fetcherError);
			}),
		);
	});
}

/**
 * Convenience function for GET requests with optional schema validation.
 *
 * @example
 * ```ts
 * import { type } from 'arktype';
 *
 * const UserSchema = type({
 *   id: 'number',
 *   name: 'string',
 *   email: 'string'
 * });
 *
 * const effect = get("/api/user", { schema: UserSchema });
 * const user = await Effect.runPromise(effect); // Fully typed and validated!
 * ```
 */
export function get<T = unknown>(
	url: string,
	options?: FetcherOptions<T>,
	params?: QueryParams,
): Effect.Effect<T, FetcherError | ValidationError, HttpClient.HttpClient>;

export function get<S extends Type<any>>(
	url: string,
	options: FetcherOptions<Type<S>> & { schema: S },
	params?: QueryParams,
): Effect.Effect<
	Type<S>,
	FetcherError | ValidationError,
	HttpClient.HttpClient
>;

export function get<T = unknown>(
	url: string,
	options?: FetcherOptions<T>,
	params?: QueryParams,
) {
	return fetcher<T>(url, "GET", options, params);
}

/**
 * Convenience function for POST requests with optional schema validation.
 */
export function post<T = unknown>(
	url: string,
	body?: RequestBody,
	options?: FetcherOptions<T>,
	params?: QueryParams,
): Effect.Effect<T, FetcherError | ValidationError, HttpClient.HttpClient>;

export function post<S extends Type<any>>(
	url: string,
	body: RequestBody,
	options: FetcherOptions<Type<S>> & { schema: S },
	params?: QueryParams,
): Effect.Effect<
	Type<S>,
	FetcherError | ValidationError,
	HttpClient.HttpClient
>;

export function post<T = unknown>(
	url: string,
	body?: RequestBody,
	options?: FetcherOptions<T>,
	params?: QueryParams,
) {
	return fetcher<T>(url, "POST", options, params, body);
}

/**
 * Convenience function for PUT requests with optional schema validation.
 */
export function put<T = unknown>(
	url: string,
	body?: RequestBody,
	options?: FetcherOptions<T>,
	params?: QueryParams,
): Effect.Effect<T, FetcherError | ValidationError, HttpClient.HttpClient>;

export function put<S extends Type<any>>(
	url: string,
	body: RequestBody,
	options: FetcherOptions<Type<S>> & { schema: S },
	params?: QueryParams,
): Effect.Effect<
	Type<S>,
	FetcherError | ValidationError,
	HttpClient.HttpClient
>;

export function put<T = unknown>(
	url: string,
	body?: RequestBody,
	options?: FetcherOptions<T>,
	params?: QueryParams,
) {
	return fetcher<T>(url, "PUT", options, params, body);
}

/**
 * Convenience function for PATCH requests with optional schema validation.
 */
export function patch<T = unknown>(
	url: string,
	body?: RequestBody,
	options?: FetcherOptions<T>,
	params?: QueryParams,
): Effect.Effect<T, FetcherError | ValidationError, HttpClient.HttpClient>;

export function patch<S extends Type<any>>(
	url: string,
	body: RequestBody,
	options: FetcherOptions<Type<S>> & { schema: S },
	params?: QueryParams,
): Effect.Effect<
	Type<S>,
	FetcherError | ValidationError,
	HttpClient.HttpClient
>;

export function patch<T = unknown>(
	url: string,
	body?: RequestBody,
	options?: FetcherOptions<T>,
	params?: QueryParams,
) {
	return fetcher<T>(url, "PATCH", options, params, body);
}

/**
 * Convenience function for DELETE requests with optional schema validation.
 */
export function del<T = unknown>(
	url: string,
	options?: FetcherOptions<T>,
	params?: QueryParams,
): Effect.Effect<T, FetcherError | ValidationError, HttpClient.HttpClient>;

export function del<S extends Type<any>>(
	url: string,
	options: FetcherOptions<Type<S>> & { schema: S },
	params?: QueryParams,
): Effect.Effect<
	Type<S>,
	FetcherError | ValidationError,
	HttpClient.HttpClient
>;

export function del<T = unknown>(
	url: string,
	options?: FetcherOptions<T>,
	params?: QueryParams,
) {
	return fetcher<T>(url, "DELETE", options, params);
}

/**
 * Convenience function for OPTIONS requests with optional schema validation.
 */
export function options<T = unknown>(
	url: string,
	options?: FetcherOptions<T>,
	params?: QueryParams,
): Effect.Effect<T, FetcherError | ValidationError, HttpClient.HttpClient>;

export function options<S extends Type<any>>(
	url: string,
	options: FetcherOptions<Type<S>> & { schema: S },
	params?: QueryParams,
): Effect.Effect<
	Type<S>,
	FetcherError | ValidationError,
	HttpClient.HttpClient
>;

export function options<T = unknown>(
	url: string,
	options?: FetcherOptions<T>,
	params?: QueryParams,
) {
	return fetcher<T>(url, "OPTIONS", options, params);
}

/**
 * Convenience function for HEAD requests with optional schema validation.
 */
export function head<T = unknown>(
	url: string,
	options?: FetcherOptions<T>,
	params?: QueryParams,
): Effect.Effect<T, FetcherError | ValidationError, HttpClient.HttpClient>;

export function head<S extends Type<any>>(
	url: string,
	options: FetcherOptions<Type<S>> & { schema: S },
	params?: QueryParams,
): Effect.Effect<
	Type<S>,
	FetcherError | ValidationError,
	HttpClient.HttpClient
>;

export function head<T = unknown>(
	url: string,
	options?: FetcherOptions<T>,
	params?: QueryParams,
) {
	return fetcher<T>(url, "HEAD", options, params);
}

// --- Utility functions for common schema patterns ---

/**
 * Helper function to create a paginated response schema.
 *
 * @example
 * ```ts
 * const UserSchema = type({
 *   id: 'number',
 *   name: 'string'
 * });
 *
 * const PaginatedUsersSchema = createPaginatedSchema(UserSchema);
 *
 * const effect = get("/api/users", {
 *   schema: PaginatedUsersSchema
 * });
 * ```
 */
export const createPaginatedSchema = <T>(itemSchema: Type<T>) => {
	return type({
		data: [itemSchema],
		pagination: {
			page: "number",
			pageSize: "number",
			total: "number",
			totalPages: "number",
		},
	});
};

/**
 * Helper function to create an API response wrapper schema.
 *
 * @example
 * ```ts
 * const UserSchema = type({
 *   id: 'number',
 *   name: 'string'
 * });
 *
 * const WrappedUserSchema = createApiResponseSchema(UserSchema);
 *
 * const effect = get("/api/user/123", {
 *   schema: WrappedUserSchema
 * });
 * ```
 */
export const createApiResponseSchema = <T>(dataSchema: Type<T>) => {
	return type({
		success: "boolean",
		data: dataSchema,
		message: "string?",
		errors: "string[]?",
	});
};
