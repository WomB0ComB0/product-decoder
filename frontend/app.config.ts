import MillionLint from "@million/lint";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, UserConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsConfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { tanstackStart } from '@tanstack/react-start/plugin/vite'

export default defineConfig(({ mode }) => {
  const isDevelopment = mode == 'development';
  return {
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
      react({
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
      }),
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org:
          process.env.SENTRY_ORG ||
          (() => {
            throw new Error('SENTRY_ORG is not set');
          })(),
        project:
          process.env.SENTRY_PROJECT ||
          (() => {
            throw new Error('SENTRY_PROJECT is not set');
          })(),
        release: {
          // Automatically detect release name or use env override
          name: process.env.SENTRY_RELEASE,
          inject: true,
          create: true,
          finalize: true,
        },
        sourcemaps: {
          // Only upload source maps from the dist directory
          assets: 'dist/**/*.map',
          // Ignore node_modules and test files
          ignore: ['**/node_modules/**', '**/*.test.*', '**/*.cy.*'],
        },
        debug: isDevelopment,
        telemetry: true,
        errorHandler: (err) =>
          Error.isError(err)
            ? console.warn('[sentry-vite-plugin]', err)
            : console.warn('[sentry-vite-plugin]', err),
        bundleSizeOptimizations: {
          excludeDebugStatements: true,
          excludeTracing: false,
          excludeReplayShadowDom: true,
          excludeReplayIframe: true,
          excludeReplayWorker: true,
        },
        reactComponentAnnotation: {
          enabled: true,
          ignoredComponents: ['Provider', 'RouterProvider'],
        },
      }),
      tanstackStart({

      })
    ],
    ssr: {
      external: ["@tanstack/react-query", "@tanstack/react-query-devtools"],
    },
    esbuild: {
      drop: ['console', 'debugger'], // Drop console statements in production
    },
  } satisfies UserConfig
});
