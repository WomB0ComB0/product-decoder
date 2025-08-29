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

import { FetchHttpClient } from '@effect/platform';
import type { HttpClient } from '@effect/platform/HttpClient';
import { cors } from '@elysiajs/cors';
import { opentelemetry, record } from '@elysiajs/opentelemetry';
import { serverTiming } from '@elysiajs/server-timing';
import { swagger } from '@elysiajs/swagger';
import vision from '@google-cloud/vision';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { logger } from '@packages/logger';
import {
  GNewsResponse,
  get,
  RawCse,
  SearchRecommendation,
  type TRawCse,
  YoutubeSearchResponse,
} from '@packages/shared';
import type { SocketAddress } from 'bun';
import { Effect, pipe } from 'effect';
import { Elysia } from 'elysia';
import { ip } from 'elysia-ip';
import { DefaultContext, type Generator, rateLimit } from 'elysia-rate-limit';
import { elysiaHelmet } from 'elysiajs-helmet';

/**
 * Check if running on Vercel
 */
const IS_VERCEL = !!process.env.VERCEL;

/**
 * Environment variable for GNews API key.
 * @type {string | undefined}
 */
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

/**
 * Environment variable for Google API key.
 * @type {string | undefined}
 */
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

/**
 * Environment variable for Google Custom Search Engine ID.
 * @type {string | undefined}
 */
const GOOGLE_CSE_CX = process.env.GOOGLE_SEARCH_ENGINE_ID;

/**
 * YouTube API key, reusing Google API key.
 * @type {string | undefined}
 */
const YT_API_KEY = GOOGLE_API_KEY;

if (!GNEWS_API_KEY) throw new Error('Missing GNEWS_API_KEY');
if (!GOOGLE_API_KEY) throw new Error('Missing GOOGLE_API_KEY');
if (!GOOGLE_CSE_CX) throw new Error('Missing GOOGLE_SEARCH_ENGINE_ID');

/**
 * Base URL for GNews API.
 * @type {string}
 */
const GNEWS_BASE = 'https://gnews.io/api/v4';

/**
 * Endpoint for Google Custom Search Engine API.
 * @type {string}
 */
const CSE_ENDPOINT = 'https://customsearch.googleapis.com/customsearch/v1';

/**
 * Endpoint for YouTube Search API.
 * @type {string}
 */
const YT_SEARCH_ENDPOINT = 'https://www.googleapis.com/youtube/v3/search';

/**
 * Stringifies an object with 2-space indentation for pretty-printing JSON.
 * @param {object} o - The object to stringify.
 * @returns {string} The pretty-printed JSON string.
 */
const Stringify = (o: object): string => JSON.stringify(o, null, 2);

/**
 * Generates a unique identifier for rate limiting based on the request's IP address.
 * @param {*} _r - The request object (unused).
 * @param {*} _s - The response object (unused).
 * @param {{ ip: SocketAddress }} param2 - The context containing the IP address.
 * @returns {string} The IP address or 'unknown' if not available.
 */
const ipGenerator: Generator<{ ip: SocketAddress }> = (_r, _s, { ip }) => ip?.address ?? 'unknown';

/**
 * The current application version, loaded from package.json.
 * @type {string}
 */
const version: string =
  (await import('../package.json', { with: { type: 'json' } })
    .then((t) => t.version)
    .catch((err) => {
      logger.error('Failed to load version from package.json', err);
    })) || 'N/A';

/**
 * Middleware for timing and logging the duration of each request.
 * Adds a `start` timestamp to the store before handling,
 * and logs the duration after handling.
 * @type {Elysia}
 */
const timingMiddleware = new Elysia()
  .state({ start: 0 })
  .onBeforeHandle(({ store }) => (store.start = Date.now()))
  .onAfterHandle(({ path, store: { start } }) => {
    const duration = Date.now() - start;
    logger.info(`[Elysia] ${path} took ${duration}ms to execute`, { path, duration });
  });

/**
 * Runs an Effect in the Effect runtime, providing the FetchHttpClient layer if needed.
 * @template A The success type of the Effect.
 * @template E The error type of the Effect.
 * @template R The environment type of the Effect.
 * @param {Effect.Effect<A, E, R>} eff - The Effect to run.
 * @returns {Promise<A>} A promise resolving to the Effect's result.
 */
function run<A, E>(eff: Effect.Effect<A, E, never>): Promise<A>;
function run<A, E>(eff: Effect.Effect<A, E, HttpClient>): Promise<A>;
function run<A, E, R>(eff: Effect.Effect<A, E, R>): Promise<A> {
  const provided = (eff as Effect.Effect<A, E, HttpClient | never>).pipe(
    Effect.provide(FetchHttpClient.layer),
  );
  return Effect.runPromise(provided as Effect.Effect<A, E, never>);
}

/**
 * Google Vision client for image annotation.
 * Uses environment variable for credentials on Vercel or file for local dev.
 * @type {vision.ImageAnnotatorClient}
 */
const client = new vision.ImageAnnotatorClient(
  process.env.GCP_SERVICE_ACCOUNT_JSON
    ? { credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON) }
    : { keyFilename: './credentials.json' },
);

/**
 * Normalizes the web detection response from Google Vision API.
 * Extracts web entities, matching images, and pages with matching images.
 * @param {any} res - The raw response from Google Vision API.
 * @returns {object} The normalized web detection result.
 */
function normalizeWebDetection(res: any) {
  const web = res?.webDetection ?? {};
  return {
    webEntities: (web.webEntities ?? []).map((e: any) => ({
      description: e.description,
      score: e.score,
    })),
    fullMatchingImages: (web.fullMatchingImages ?? []).map((i: any) => ({
      url: i.url ?? '',
    })),
    partialMatchingImages: (web.partialMatchingImages ?? []).map((i: any) => ({
      url: i.url ?? '',
    })),
    pagesWithMatchingImages: (web.pagesWithMatchingImages ?? []).map((p: any) => ({
      url: p.url ?? '',
      pageTitle: p.pageTitle,
    })),
  };
}

/**
 * OpenTelemetry resource for Jaeger tracing.
 * Sets the service name for trace identification.
 * @type {import('@opentelemetry/resources').Resource}
 */
const otelResource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'elysia-api',
});

/**
 * OTLP trace exporter for sending traces to Jaeger.
 * Only configured for local development.
 * @type {OTLPTraceExporter | undefined}
 */
const otlpExporter = !IS_VERCEL
  ? new OTLPTraceExporter({
      url: 'http://localhost:4318/v1/traces',
      keepAlive: true,
    })
  : undefined;

/**
 * Batch span processor for OpenTelemetry.
 * Handles batching and exporting of trace spans.
 * Only configured for local development.
 * @type {BatchSpanProcessor | undefined}
 */
const batchSpanProcessor = otlpExporter
  ? new BatchSpanProcessor(otlpExporter, {
      maxExportBatchSize: 512,
      scheduledDelayMillis: 5_000,
      exportTimeoutMillis: 30_000,
      maxQueueSize: 2_048,
    })
  : undefined;

/**
 * Content Security Policy permissions for Helmet.
 * Used to configure allowed sources for various content types.
 * @type {object}
 */
const permission = {
  SELF: "'self'",
  UNSAFE_INLINE: "'unsafe-inline'",
  HTTPS: 'https:',
  DATA: 'data:',
  NONE: "'none'",
  BLOB: 'blob:',
} as const;

/**
 * Utility routes for status, version, info, and health endpoints.
 * Includes:
 *   - Root welcome endpoint
 *   - Status (uptime, memory, version, environment)
 *   - Version
 *   - Info (contact, documentation)
 *   - Health check
 * @type {Elysia}
 */
const utilityRoutes = new Elysia()
  .use(timingMiddleware)
  .get(
    '/',
    () =>
      record('root.get', () => {
        return Stringify({
          message: `Welcome to the API. Don't be naughty >:(`,
          status: 200,
        });
      }),
    {
      detail: {
        summary: 'Root endpoint',
        description: 'Welcome message for the API',
        tags: ['Utility'],
      },
    },
  )
  .get(
    '/status',
    async () =>
      record('status.get', async () => {
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();
        const appVersion = version;
        return Stringify({
          message: 'Application status',
          status: 200,
          data: {
            uptime: `${uptime.toFixed(2)} seconds`,
            memory: {
              rss: `${(memoryUsage.rss / 1_024 / 1_024).toFixed(2)} MB`,
              heapTotal: `${(memoryUsage.heapTotal / 1_024 / 1_024).toFixed(2)} MB`,
              heapUsed: `${(memoryUsage.heapUsed / 1_024 / 1_024).toFixed(2)} MB`,
              external: `${(memoryUsage.external / 1_024 / 1_024).toFixed(2)} MB`,
            },
            version: appVersion,
            environment: process.env.NODE_ENV || 'development',
            runtime: IS_VERCEL ? 'vercel' : 'local',
          },
        });
      }),
    {
      detail: {
        summary: 'Get application status',
        description: 'Returns uptime, memory usage, version, and environment',
        tags: ['Utility'],
      },
    },
  )
  .get(
    '/version',
    async () =>
      record('version.get', async () => {
        const appVersion = version;
        return Stringify({
          version: appVersion,
          status: 200,
        });
      }),
    {
      detail: {
        summary: 'Get API version',
        description: 'Returns the current API version',
        tags: ['Info'],
      },
    },
  )
  .get(
    '/info',
    () =>
      record('info.get', () => {
        return Stringify({
          message: 'Information about the API',
          status: 200,
          data: {
            contact: 'example@example.com',
            documentationUrl: 'https://docs.your-api.com',
          },
        });
      }),
    {
      detail: {
        summary: 'Get API info',
        description: 'Returns information about the API',
        tags: ['Info'],
      },
    },
  )
  .get(
    '/health',
    async () =>
      record('health.get', () => {
        return Stringify({ message: 'ok', status: 200 });
      }),
    {
      detail: {
        summary: 'Health check',
        description: 'Returns ok if the API is healthy',
        tags: ['Health'],
      },
    },
  );

/**
 * API routes for main application functionality.
 * Includes:
 *   - Google reverse image search (Vision API)
 *   - GNews search and top headlines
 *   - Google Custom Search Engine (CSE)
 *   - YouTube video search
 * @type {Elysia}
 */
const apiRoutes = new Elysia({ prefix: '/api' })
  .post(
    '/google/reverse-image',
    /**
     * Handles reverse image search using Google Vision API.
     * Expects a FormData body with an image file.
     * @param {object} param0 - The request context.
     * @param {FormData} param0.body - The form data containing the image file.
     * @returns {Promise<Response>} The response with web detection results or error.
     */
    async ({ body }) => {
      return record('reverse-image.post', async () => {
        // Use Elysia's body parameter instead of request.formData()
        const form = body as FormData;
        const file = form.get('file');

        if (!(file instanceof File)) {
          return new Response(JSON.stringify({ error: 'No file provided' }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
          });
        }

        if (!/^image\//.test(file.type)) {
          return new Response(JSON.stringify({ error: 'Unsupported media type' }), {
            status: 415,
            headers: { 'content-type': 'application/json' },
          });
        }

        const ab = await file.arrayBuffer();
        const content = Buffer.from(ab);

        const [res] = await client.webDetection({ image: { content } });
        const data = normalizeWebDetection(res);

        return new Response(JSON.stringify({ ok: true, data }), {
          headers: { 'content-type': 'application/json' },
        });
      });
    },
    {
      type: 'formdata', // Tell Elysia to expect FormData
      detail: {
        summary: 'Reverse image search',
        description: 'Upload an image for reverse search using Google Vision API',
        tags: ['Vision'],
      },
    },
  )
  .get(
    '/gnews/search',
    /**
     * Searches news articles using the GNews API.
     * Accepts query parameters for search customization.
     * @param {object} param0 - The request context.
     * @param {Record<string, string>} param0.query - The query parameters.
     * @returns {Promise<Response>} The response with search results.
     */
    async ({ query }) => {
      return record('gnews.search.get', async () => {
        const p = query as Record<string, string>;
        const params = {
          apikey: GNEWS_API_KEY,
          q: p.q ?? '',
          lang: p.lang,
          country: p.country,
          max: p.max,
          in: p.in,
          nullable: p.nullable,
          from: p.from,
          to: p.to,
          sortby: p.sortby as 'relevance' | 'publishedAt' | undefined,
        };

        const eff = pipe(get(`${GNEWS_BASE}/search`, { schema: GNewsResponse }, params));

        const res = await run(eff);
        return new Response(JSON.stringify(res), {
          headers: { 'content-type': 'application/json' },
        });
      });
    },
    {
      detail: {
        summary: 'Search news articles',
        description: 'Search for news articles using GNews API',
        tags: ['News'],
      },
    },
  )
  .get(
    '/gnews/top-headlines',
    /**
     * Retrieves top news headlines using the GNews API.
     * Accepts query parameters for filtering.
     * @param {object} param0 - The request context.
     * @param {Record<string, string>} param0.query - The query parameters.
     * @returns {Promise<Response>} The response with top headlines.
     */
    async ({ query }) => {
      return record('gnews.headlines.get', async () => {
        const p = query as Record<string, string>;
        const params = {
          apikey: GNEWS_API_KEY,
          lang: p.lang,
          country: p.country,
          max: p.max,
          nullable: p.nullable,
          category: p.category as
            | 'general'
            | 'world'
            | 'nation'
            | 'business'
            | 'technology'
            | 'entertainment'
            | 'sports'
            | 'science'
            | 'health'
            | undefined,
        };

        const eff = pipe(get(`${GNEWS_BASE}/top-headlines`, { schema: GNewsResponse }, params));

        const res = await run(eff);
        return new Response(JSON.stringify(res), {
          headers: { 'content-type': 'application/json' },
        });
      });
    },
    {
      detail: {
        summary: 'Get top headlines',
        description: 'Get top news headlines using GNews API',
        tags: ['News'],
      },
    },
  )
  .get(
    '/google/cse',
    /**
     * Performs a search using Google Custom Search Engine (CSE).
     * Accepts query parameters for search customization.
     * @param {object} param0 - The request context.
     * @param {Record<string, string>} param0.query - The query parameters.
     * @returns {Promise<Response>} The response with search results or error.
     */
    async ({ query }) => {
      return record('google.cse.get', async () => {
        try {
          const p = query as Record<string, string>;
          const fields =
            p.fields ??
            'searchInformation(totalResults,searchTime,formattedTotalResults,formattedSearchTime),items(link,title,snippet,pagemap/cse_thumbnail)';

          const params = {
            key: GOOGLE_API_KEY,
            cx: GOOGLE_CSE_CX,
            q: p.q ?? '',
            num: p.num ?? '10',
            start: p.start,
            safe: p.safe,
            lr: p.lr,
            siteSearch: p.siteSearch,
            fields,
          } as const;

          const raw = (await run(
            pipe(get(CSE_ENDPOINT, { schema: RawCse }, params)),
          )) as unknown as TRawCse;

          const transformed = {
            info: {
              totalResults: raw.searchInformation?.totalResults ?? '0',
              searchTime: raw.searchInformation?.searchTime ?? 0,
              formattedTotalResults: raw.searchInformation?.formattedTotalResults ?? '0',
              formattedSearchTime: raw.searchInformation?.formattedSearchTime ?? '0',
            },
            // @ts-ignore
            items: (raw.items ?? []).map((it) => {
              const t = it?.pagemap?.cse_thumbnail?.[0];
              return {
                link: it?.link ?? '',
                title: it?.title ?? 'No title',
                snippet: it?.snippet ?? 'No snippet available',
                ...(t?.src
                  ? {
                      thumbnail: {
                        src: String(t.src),
                        width: String(t.width ?? ''),
                        height: String(t.height ?? ''),
                      },
                    }
                  : {}),
              };
            }),
          };

          const ok = SearchRecommendation.assert(transformed);
          return new Response(JSON.stringify(ok), {
            headers: { 'content-type': 'application/json' },
          });
        } catch (e) {
          logger.error('CSE error', e);
          return new Response(
            JSON.stringify({
              error: 'Google CSE failed',
              details: e instanceof Error ? e?.message : String(e),
            }),
            { status: 502, headers: { 'content-type': 'application/json' } },
          );
        }
      });
    },
    {
      detail: {
        summary: 'Google Custom Search',
        description: 'Search using Google Custom Search Engine',
        tags: ['Search'],
      },
    },
  )
  .get(
    '/google/youtube/search',
    /**
     * Searches for YouTube videos using the YouTube Data API.
     * Accepts query parameters for search customization.
     * @param {object} param0 - The request context.
     * @param {Record<string, string>} param0.query - The query parameters.
     * @returns {Promise<Response>} The response with YouTube search results.
     */
    async ({ query }) => {
      return record('youtube.search.get', async () => {
        const p = query as Record<string, string>;
        const params = {
          key: YT_API_KEY,
          part: 'snippet',
          q: p.q ?? '',
          type: 'video',
          maxResults: p.maxResults ?? '10',
          pageToken: p.pageToken,
        };

        const eff = pipe(get(YT_SEARCH_ENDPOINT, { schema: YoutubeSearchResponse }, params));

        const res = await run(eff);
        return new Response(JSON.stringify(res), {
          headers: { 'content-type': 'application/json' },
        });
      });
    },
    {
      detail: {
        summary: 'Search YouTube videos',
        description: 'Search for YouTube videos using YouTube Data API',
        tags: ['YouTube'],
      },
    },
  );

/**
 * Main application instance with all middleware and routes.
 * Configures:
 *   - Swagger documentation
 *   - Tracing and logging
 *   - Security headers (Helmet)
 *   - IP extraction
 *   - OpenTelemetry tracing (local only)
 *   - Server timing
 *   - CORS
 *   - Rate limiting
 *   - Utility and API routes
 *   - Error handling
 * @type {Elysia}
 */
export const app = new Elysia({ name: 'Server API' })
  .use(
    swagger({
      path: '/swagger',
      documentation: {
        info: {
          title: '🦊 Product Decoder API Server',
          version: version || '1.0.0',
          description: `
						**Product Decoder API Server**

						This API provides:
						- 🔍 **Search & Vision**: Google Custom Search, YouTube search, and reverse image search
						- 📰 **News**: GNews integration for articles and headlines
						- 🚀 **Performance**: OpenTelemetry tracing, rate limiting, and caching
						- 🔒 **Security**: Helmet security headers and CORS protection
						- 📊 **Monitoring**: Health checks, status endpoints, and observability

						> **Contact:** [API Support](mailto:support@your-api.com)
          `,
          contact: {
            name: 'API Support',
            email: 'support@your-api.com',
          },
        },
        tags: [
          {
            name: 'Utility',
            description: 'Status, version, and health check endpoints',
          },
          {
            name: 'Info',
            description: 'API information endpoints',
          },
          {
            name: 'Vision',
            description: 'Google Vision API integration',
          },
          {
            name: 'News',
            description: 'GNews API integration',
          },
          {
            name: 'Search',
            description: 'Google Custom Search integration',
          },
          {
            name: 'YouTube',
            description: 'YouTube Data API integration',
          },
        ],
      },
    }),
  )
  .trace(
    /**
     * Configures tracing hooks for before/after/error handling.
     * Logs timing and errors for each request.
     * @param {object} param0 - The tracing context.
     */
    async ({ onBeforeHandle, onAfterHandle, onError }) => {
      onBeforeHandle(({ begin, onStop }) => {
        onStop(({ end }) => {
          logger.debug('BeforeHandle took', { duration: end - begin });
        });
      });
      onAfterHandle(({ begin, onStop }) => {
        onStop(({ end }) => {
          logger.debug('AfterHandle took', { duration: end - begin });
        });
      });
      onError(({ begin, onStop }) => {
        onStop(({ end, error }) => {
          logger.error('Error occurred after trace', error, { duration: end - begin });
        });
      });
    },
  )
  .use(
    elysiaHelmet({
      csp: {
        defaultSrc: [permission.SELF],
        scriptSrc: [permission.SELF, permission.UNSAFE_INLINE],
        styleSrc: [permission.SELF, permission.UNSAFE_INLINE],
        imgSrc: [permission.SELF, permission.DATA, permission.HTTPS],
        useNonce: true,
      },
      hsts: {
        maxAge: 31_536_000,
        includeSubDomains: true,
        preload: true,
      },
      frameOptions: 'DENY',
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: {
        camera: [permission.NONE],
        microphone: [permission.NONE],
      },
    }),
  )
  .use(ip())
  .use(
    // Only use OpenTelemetry in local development
    batchSpanProcessor
      ? opentelemetry({
          resource: otelResource,
          spanProcessors: [batchSpanProcessor],
        })
      : new Elysia(),
  )
  .use(
    serverTiming({
      trace: {
        request: true,
        parse: true,
        transform: true,
        beforeHandle: true,
        handle: true,
        afterHandle: true,
        error: true,
        mapResponse: true,
        total: true,
      },
    }),
  )
  // --- CORS configuration for cross-origin requests ---
  .use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Configurable frontend URL
      methods: ['GET', 'POST', 'OPTIONS'], // Specify allowed HTTP methods
      allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
      credentials: true, // Allow credentials (e.g., cookies, authorization headers)
      maxAge: 86_400, // Cache the preflight response for 24 hours
    }),
  )
  .use(
    rateLimit({
      duration: 60_000,
      max: 100,
      headers: true,
      scoping: 'scoped',
      countFailedRequest: true,
      errorResponse: new Response(
        Stringify({
          error: 'Too many requests',
        }),
        { status: 429 },
      ),
      generator: ipGenerator,
      context: new DefaultContext(10_000),
    }),
  )
  .use(utilityRoutes)
  .use(apiRoutes)
  .onError(
    /**
     * Global error handler for the API.
     * Logs the error and returns a JSON error response.
     * @param {object} param0 - The error context.
     * @param {string} param0.code - The error code.
     * @param {Error} param0.error - The error object.
     * @param {object} param0.set - The response setter.
     * @returns {string} The JSON error response.
     */
    ({ code, error, set }) => {
      logger.error('API error handler', error, { code });
      set.status = code === 'NOT_FOUND' ? 404 : 500;
      return Stringify({
        error: Error.isError(error) ? Stringify({ error }) : Stringify({ error }),
        status: set.status,
      });
    },
  );

/**
 * Gracefully shuts down telemetry on Vercel using waitUntil if available.
 * For local development, flushes the batch span processor.
 */
export const shutdown = async (): Promise<void> => {
  if (IS_VERCEL) {
    // On Vercel, we can't rely on process signals, so this is mainly for cleanup
    logger.info('Vercel function cleanup');
  } else {
    logger.info('Shutting down 🦊 Elysia');
    if (batchSpanProcessor) {
      await batchSpanProcessor.forceFlush();
    }
  }
};

// Don't set up process listeners on Vercel
if (!IS_VERCEL) {
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

/**
 * The type of the main Elysia application instance.
 * @typedef {typeof app} App
 */
export type App = typeof app;
