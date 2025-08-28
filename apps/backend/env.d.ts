declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production';
      readonly SERVER_PORT: string;
      readonly DATABASE_URL: string;
      readonly JWT_SECRETS: string;
      readonly JWT_EXPIRED: string | number;
      readonly SENTRY_DSN: string;
      readonly SENTRY_AUTH_TOKEN: string;
      readonly SENTRY_PROJECT: string;
      readonly SENTRY_ORG: string;
      readonly SENTRY_URL: string;
      readonly NEWS_API_KEY: string;
      readonly GNEWS_API_KEY: string;
      readonly ARTICLE_API_KEY: string;
      readonly FOOD_API_KEY: string;
      readonly GOOGLE_API_KEY: string;
      readonly GOOGLE_SEARCH_ENGINE_ID: string;
      readonly GEMINI_API_KEY: string;
      readonly GOOGLE_CSE_CX: string;
      readonly GCP_CREDENTIALS_JSON: string;
    }
  }
}

export {};
