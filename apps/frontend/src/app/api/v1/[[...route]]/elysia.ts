import { Stringify } from "@/utils";
import { record } from "@elysiajs/opentelemetry";
import vision from '@google-cloud/vision';
import { get, GNewsResponse, logger, RawCse, run, SearchRecommendation, TRawCse, YoutubeSearchResponse } from "@packages/shared";
import { pipe } from "effect";
import Elysia from "elysia";
import { CSE_ENDPOINT, GNEWS_API_KEY, GNEWS_BASE, GOOGLE_API_KEY, GOOGLE_CSE_CX, IS_VERCEL, version, YT_API_KEY, YT_SEARCH_ENDPOINT } from "./constants";
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
 * Google Vision client for image annotation.
 * Uses environment variable for credentials on Vercel or file for local dev.
 * @type {vision.ImageAnnotatorClient}
 */
const client = new vision.ImageAnnotatorClient(
  process.env.GCP_SERVICE_ACCOUNT_JSON
    ? { credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON || (() => {throw Error("GCP_SERVICE_ACCOUNT_JSON is missing")})()) as any }
    : { 
        projectId: '', // Explicitly specify the project ID
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './credentials.json' 
      },
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
const apiRoutes = new Elysia()
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
        try {
          // Handle FormData from body parameter
          const form = body as FormData;
          
          if (!form || typeof form.get !== 'function') {
            return new Response(JSON.stringify({ error: 'Invalid FormData' }), {
              status: 400,
              headers: { 'content-type': 'application/json' },
            });
          }
          
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
        } catch (error) {
          console.error('Google Vision API error:', error);
          
          // Check if it's the API not enabled error
          if (error instanceof Error && error.message && error.message.includes('Cloud Vision API has not been used') && error.message.includes('disabled')) {
            return new Response(JSON.stringify({ 
              error: 'Google Cloud Vision API not enabled',
              details: 'Please enable the Cloud Vision API in your Google Cloud Console',
              solution: 'Visit: https://console.developers.google.com/apis/api/vision.googleapis.com/overview',
              fallback: {
                webEntities: [],
                fullMatchingImages: [],
                partialMatchingImages: [],
                pagesWithMatchingImages: []
              }
            }), {
              status: 503, // Service Unavailable
              headers: { 'content-type': 'application/json' },
            });
          }
          
          // Enhanced error response with more details
          const errorResponse = {
            error: 'Google Vision API error',
            details: error instanceof Error ? error.message : 'Unknown error',
            code: (error as any)?.code || 'UNKNOWN',
            projectId: 'upheld-welder-470600-i4',
            credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'Environment variable set' : 'Environment variable not set',
            timestamp: new Date().toISOString()
          };
          
          console.error('Detailed error response:', errorResponse);
          
          return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { 'content-type': 'application/json' },
          });
        }
      });
    },
    {
      type: 'formdata',
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

        // @ts-ignore works
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
        try {
          console.log('GNews top-headlines called with query:', query);
          
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

          console.log('GNews API params:', { ...params, apikey: '***' });

          const eff = pipe(get(`${GNEWS_BASE}/top-headlines`, { schema: GNewsResponse }, params));

          // @ts-ignore works
          const res = await run(eff);
          
          console.log('GNews API response received:', { 
            totalArticles: res?.totalArticles, 
            articlesCount: res?.articles?.length 
          });

          return new Response(JSON.stringify(res), {
            headers: { 
              'content-type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
          });
        } catch (error) {
          console.error('GNews top-headlines error:', error);
          
          const errorResponse = {
            error: 'GNews API error',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            endpoint: '/gnews/top-headlines',
            params: { ...query, apikey: '***' }
          };
          
          return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { 
              'content-type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
          });
        }
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

          const effect = pipe(get(CSE_ENDPOINT, { schema: RawCse }, params))

          // @ts-ignore works
          const raw = (await run(effect)) as unknown as TRawCse;

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

        // @ts-ignore works
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


export { apiRoutes, utilityRoutes };

