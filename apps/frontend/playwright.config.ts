/**
 * Copyright 2025 Product Decoder
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration
 *
 * This configuration file sets up the testing environment and defines test execution parameters
 * for running end-to-end tests with Playwright.
 *
 * @see https://playwright.dev/docs/test-configuration for complete documentation
 */

/**
 * Environment variables can be loaded from a .env file
 * Uncomment the line below to enable .env loading
 * @see https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * Parse command line arguments to check for --skip-server-start flag
 */
const skipServerStart = process.argv.includes('--skip-server-start');

/**
 * Main Playwright configuration object that defines all testing parameters and behaviors
 *
 * @property {string} testDir - Directory containing test files
 * @property {boolean} fullyParallel - Whether to run tests in parallel
 * @property {boolean} forbidOnly - Prevents test.only usage in CI
 * @property {number} retries - Number of retry attempts for failed tests
 * @property {number|undefined} workers - Number of concurrent test workers
 * @property {string} reporter - Test results reporter type
 * @property {Object} use - Shared test configuration options
 * @property {Array} projects - Browser-specific test configurations
 * @property {Object} webServer - Local development server configuration
 */
export default defineConfig({
  // Test files location
  testDir: './e2e',

  // Enable parallel test execution for better performance
  fullyParallel: true,

  // Fail if test.only is left in code during CI runs
  forbidOnly: !!process.env.CI,

  // Retry failed tests twice in CI, no retries locally
  retries: process.env.CI ? 2 : 0,

  // Use single worker in CI, default workers locally
  workers: process.env.CI ? 1 : undefined,

  // Use HTML reporter for visual test results
  reporter: 'html',

  // Global timeout for tests - using environment variable or default to 60s
  timeout: Number(process.env.PLAYWRIGHT_TIMEOUT) || 60000,

  /**
   * Global test configuration applied to all test runs
   * @see https://playwright.dev/docs/api/class-testoptions
   */
  use: {
    // Base URL for all page.goto() calls
    baseURL: 'http://127.0.0.1:3000',

    // Trace recording configuration for debugging failed tests
    trace: 'on-first-retry',

    // Action timeout - longer for CI environments
    actionTimeout: process.env.CI ? 30000 : 10000,
  },

  /**
   * Browser-specific test configurations
   * Each project represents a different browser or device target
   */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /**
     * Mobile device testing configurations
     * Tests how the application behaves on mobile viewports
     */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /**
     * Branded browser testing configurations
     * Tests against specific browser channels/versions
     */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  /**
   * Development server configuration
   * Starts a local dev server before running tests
   * Can be disabled with --skip-server-start flag for CI environments
   * where the server is started separately
   *
   * @property {string} command - Command to start the dev server
   * @property {string} url - URL where the server will be available
   * @property {boolean} reuseExistingServer - Whether to reuse an existing server instance
   * @property {number} timeout - How long to wait for the server to start (ms)
   */
  ...(!skipServerStart ? {
    webServer: {
      command: 'bun run dev',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: !process.env.CI,
      timeout: Number(process.env.PLAYWRIGHT_WEBSERVER_TIMEOUT) || 120000, // 2 minutes to start the server
    }
  } : {})
});
