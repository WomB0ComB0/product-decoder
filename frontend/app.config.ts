import MillionLint from "@million/lint";
import { wrapVinxiConfigWithSentry } from "@sentry/tanstackstart-react";
import tailwindcss from "@tailwindcss/vite";
import type { TanStackStartInputConfig } from "@tanstack/react-start-config";
import { defineConfig } from "@tanstack/react-start-config";
import { VitePWA } from "vite-plugin-pwa";
import tsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
  vite: {
    build: {
      sourcemap: "hidden",
      chunkSizeWarningLimit: Math.pow((1024 * 2), 2), // Increased from default 500kb to 1000kb
      rollupOptions: {
        maxParallelFileOps: 20, // Reduced from 300 to 20
      },
    },
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tailwindcss(),
      MillionLint.vite({
        react: "19",
        lite: true, // Enable lite mode for faster builds
        filter: {
          // Limit scope to only your app components
          include: "**/components/**/*.{tsx,jsx}",
          exclude: "**/node_modules/**/*"
        },
        optimizeDOM: false, // Disable DOM optimization to reduce complexity
      }),
      VitePWA({
        workbox: {
          cleanupOutdatedCaches: true,
          globPatterns: ["**/*"],
          maximumFileSizeToCacheInBytes: ((1024 * 2) ** 2) //
        },
        registerType: "autoUpdate",
        injectRegister: "auto",
        includeAssets: ["**/*"],
      }),
    ],
    ssr: {
      external: ["@tanstack/react-query", "@tanstack/react-query-devtools"],
    },
    esbuild: {
      drop: ['console', 'debugger'], // Drop console statements in production
    },
  },

  // https://react.dev/learn/react-compiler
  react: {
    babel: {
      plugins: [
        [
          "babel-plugin-react-compiler",
          {
            target: "19",
          },
        ],
      ],
    },
  },

  server: {
    /**
     * @see https://tanstack.com/start/latest/docs/framework/react/hosting#deployment
     *
     * preset: "cloudflare-pages",
     * unenv: cloudflare,
     */
    preset: "vercel",
  },
} satisfies TanStackStartInputConfig);

export default wrapVinxiConfigWithSentry(config, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
});
