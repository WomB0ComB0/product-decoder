import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { logger } from "@packages/shared";


/**
 * Check if running on Vercel
 */
const IS_VERCEL = !!process.env.VERCEL;

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
 * Environment variable for GNews API key.
 * @type {string | undefined}
 */
const GNEWS_API_KEY = process.env.GNEWS_API_KEY || (() => { throw Error ("GNEWS_API_KEY is missing")})();

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

/**
 * The current application version, loaded from package.json.
 * @type {string}
 */
const version: string =
  (await import('../../../../../package.json', { with: { type: 'json' } })
    .then((t) => t.version)
    .catch((err) => {
      logger.error('Failed to load version from package.json', err);
    })) || 'N/A';

export {
  version,
  IS_VERCEL,
  otelResource,
  permission,
  batchSpanProcessor,
  GNEWS_BASE,
  CSE_ENDPOINT,
  YT_SEARCH_ENDPOINT,
  GNEWS_API_KEY,
  GOOGLE_API_KEY,
  GOOGLE_CSE_CX,
  YT_API_KEY
}
