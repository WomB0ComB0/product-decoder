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

import { env } from 'elysia';
// Local development server only
import { app } from './app';

const port = Number(env.SERVER_PORT || 3_000);

// Start timing for startup
console.time('⌛ Startup Time');

app.listen(
  { port, reusePort: true, hostname: '::' },
  /**
   * Callback for when the server starts listening.
   * Logs environment, versions, and server URL.
   * @param {object} server - The server instance.
   */
  (server) => {
    console.timeEnd('⌛ Startup Time');
    console.log(`🌱 NODE_ENV: ${env.NODE_ENV || 'development'}`);

    // Only show Bun version in local development
    if (!process.env.VERCEL && typeof Bun !== 'undefined') {
      console.log(`🍙 Bun Version: ${Bun.version}`);
    }

    console.log(`🦊 Elysia.js Version: ${require('elysia/package.json').version}`);
    console.log(`🚀 Server is running at ${server.url}`);
    console.log('--------------------------------------------------');
  },
);

/**
 * The type of the main Elysia application instance.
 * @typedef {typeof app} App
 */
export type App = typeof app;
