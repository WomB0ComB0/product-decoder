/**
 * Copyright 2025 Mike Odnis
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

export default (await import('cypress')).defineConfig({
  viewportWidth: 1000,
  viewportHeight: 800,
  defaultCommandTimeout: 40000,
  pageLoadTimeout: 120000,
  video: true,
  watchForFileChanges: false,
  scrollBehavior: 'center',
  retries: {
    runMode: 1,
    openMode: 0,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      return require('./cypress/plugins/index.js')(on, config);
    },
  },
});
