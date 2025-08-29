declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: "development" | "production";
      readonly BASE_URL: string;
      readonly SENTRY_DSN: string;
      readonly SENTRY_AUTH_TOKEN: string;
      readonly SENTRY_PROJECT: string;
      readonly SENTRY_ORG: string;
      readonly SENTRY_URL: string;
      readonly DATABASE_URL: string;
      readonly BETTER_AUTH_SECRET: string;
      readonly GITHUB_CLIENT_ID: string;
      readonly GITHUB_CLIENT_SECRET: string;
      readonly GOOGLE_CLIENT_ID: string;
      readonly GOOGLE_CLIENT_SECRET: string;
      readonly NEXT_PUBLIC_CLERK_SIGN_IN_URL: string;
      readonly NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: string;
      readonly NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: string;
      readonly NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
      readonly CLERK_SECRET_KEY: string;
      readonly GCP_SERVICE_ACCOUNT_JSON: string;
    }
  }
}

export { };
