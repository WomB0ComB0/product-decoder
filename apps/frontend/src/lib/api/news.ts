// Minimal stub for NewsAPI integration.
// We avoid importing `newsapi` here so the Next client build doesn't try to resolve
// the package when it's not installed. This file provides a safe placeholder
// so the UI can run in local development without the NewsAPI dependency.

const NEWS_API_KEY = process.env.NEWS_API_KEY;
if (!NEWS_API_KEY) {
	// eslint-disable-next-line no-console
	console.warn("NEWS_API_KEY not set — news features will be disabled");
}

/**
 * Client-safe placeholder. Other modules may import `newsapi` but should avoid
 * calling `getNewsApi` in the browser.
 */
export const newsapi: null = null;

/**
 * Server-side helper placeholder. If you install `newsapi` and set the env var,
 * replace this implementation to return a real NewsAPI instance. For now we
 * return `null` to keep the runtime stable.
 */
export async function getNewsApi(): Promise<null> {
	// If you need NewsAPI during development, install the package and provide
	// NEWS_API_KEY in `apps/frontend/.env.local`.
	return null;
}

export default null;
