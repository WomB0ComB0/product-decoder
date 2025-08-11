import MillionLint from "@million/lint";
import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, UserConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from '@tanstack/react-start/plugin/vite'

export default defineConfig(({ mode }) => {
  const isDevelopment = mode == 'development';
  return {
    build: {
      sourcemap: "hidden",
      chunkSizeWarningLimit: Math.pow((1024 * 2), 2), // Increased from default 500kb to 1000kb
      rollupOptions: {
        maxParallelFileOps: 20, // Reduced from 300 to 20
        external: [
          // Externalize Node.js-only dependencies
          'mock-aws-s3',
          'aws-sdk',
          'nock',
          '@mapbox/node-pre-gyp',
          // Externalize problematic ESM packages
          'unicorn-magic',
          'globby',
          'nitropack',
          '@tanstack/react-start-config',
          '@tanstack/react-start-plugin',
          '@tanstack/router-generator'
        ],
      },
    },
    optimizeDeps: {
      exclude: [
        // Exclude problematic dependencies from pre-bundling
        'lightningcss',
        '@mapbox/node-pre-gyp',
        'mock-aws-s3',
        'aws-sdk',
        'nock',
        // Exclude TanStack packages that have ESM issues
        '@tanstack/react-start-config',
        '@tanstack/react-start-plugin',
        '@tanstack/router-generator',
        // Exclude globby and nitropack completely
        'globby',
        'nitropack',
        // Exclude all nitropack-related packages
        '@nitrojs/core', 
        '@nitrojs/rollup',
        '@nitrojs/unjs',
        'unjs'
      ],
      include: [
        // Force include common dependencies to avoid issues
        'react',
        'react-dom',
        '@tanstack/react-query',
        '@tanstack/react-router'
      ],
    },
    resolve: {
      conditions: ['import', 'module', 'browser', 'default'],
      mainFields: ['module', 'main', 'browser']
    },
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tailwindcss(),
      MillionLint
        .vite({
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
          process.env.SENTRY_ORG,
        project:
          process.env.SENTRY_PROJECT,
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
        // https://github.com/TanStack/router/discussions/2863#discussioncomment-13713677
        customViteReactPlugin: true,

        tsr: {
          quoteStyle: "double",
          semicolons: true,
        },

        // https://tanstack.com/start/latest/docs/framework/react/hosting#deployment
        // target: "node-server",
      }),
    ],
    ssr: {
      external: [
        "@tanstack/react-query",
        "@tanstack/react-query-devtools",
        // Add Node.js-only dependencies to SSR external
        'lightningcss',
        '@mapbox/node-pre-gyp',
        'mock-aws-s3',
        'aws-sdk',
        'nock',
        // Add globby and nitropack to SSR externals
        'globby',
        'nitropack',
        '@nitrojs/core',
        '@nitrojs/rollup',
        '@nitrojs/unjs',
        'unjs'
      ],
      noExternal: [
        // Force bundle client-side dependencies
        /^(?!node:)/,
      ],
    },
    esbuild: {
      drop: ['console', 'debugger'], // Drop console statements in production
    },
    define: {
      // Define globals to avoid runtime errors
      global: 'globalThis',
    },
  } satisfies UserConfig
});
