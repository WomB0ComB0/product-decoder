declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production';
      readonly SENTRY_DSN: string;
      readonly SENTRY_AUTH_TOKEN: string;
      readonly SENTRY_PROJECT: string;
      readonly SENTRY_ORG: string;
      readonly SENTRY_URL: string;
      readonly SERVER_PORT: string;
      readonly DATABASE_URL: string;
      readonly JWT_SECRETS: string;
      readonly JWT_EXPIRED: string;
    }
  }
}

export {};
