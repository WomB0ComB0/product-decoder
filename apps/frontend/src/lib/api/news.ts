// @ts-expect-error
import NewsAPI from "newsapi";

const NEWS_API_KEY = process.env.VITE_NEWS_API_KEY;
if (!NEWS_API_KEY) throw new Error("NEWS_API_KEY not set");
const newsapi = new NewsAPI(NEWS_API_KEY);

export { newsapi };
