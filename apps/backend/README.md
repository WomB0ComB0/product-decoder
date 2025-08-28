<!--
  Copyright 2025 Mike Odnis
 
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
      http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

# Product Decoder Backend

This is an Elysia.js API server that provides search functionality, news aggregation, and image analysis capabilities. It's designed to run both locally and on Vercel.

## Development

### Local Development

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Set up Google Cloud credentials:
   - Copy your service account JSON file to `credentials.json` in the project root
   - Or set the `GCP_SERVICE_ACCOUNT_JSON` environment variable with the JSON content

3. Fill in your API keys in `.env`:
   - `GNEWS_API_KEY` - GNews API key
   - `GOOGLE_API_KEY` - Google Cloud API key  
   - `GOOGLE_SEARCH_ENGINE_ID` - Google Custom Search Engine ID

4. Start the development server:
   ```bash
   bun run dev
   ```

The server will start at `http://localhost:3001` by default.

### Production (Vercel)

The app is configured to deploy to Vercel automatically. The key differences for Vercel:

1. **No server listening**: The app is exported without calling `.listen()`
2. **Node.js runtime**: Uses Node.js instead of Bun for better compatibility
3. **Environment-based credentials**: Google Cloud credentials are passed via `GCP_SERVICE_ACCOUNT_JSON` env var
4. **Serverless functions**: Each request is handled as a separate function invocation

#### Vercel Environment Variables

Set these in your Vercel project settings:

- `GNEWS_API_KEY` - Your GNews API key
- `GOOGLE_API_KEY` - Your Google Cloud API key
- `GOOGLE_SEARCH_ENGINE_ID` - Your Google Custom Search Engine ID
- `GCP_SERVICE_ACCOUNT_JSON` - Your Google Cloud service account JSON as a string
- `FRONTEND_URL` - Your frontend domain for CORS (optional)

#### Google Cloud Credentials

**Option A: Environment Variable (Recommended)**
Set `GCP_SERVICE_ACCOUNT_JSON` in Vercel with your service account JSON content.

**Option B: File-based**
Include `credentials.json` in your repo (not recommended for security).

## Architecture

- **`src/app.ts`** - Main Elysia app without `.listen()` call
- **`src/server.ts`** - Local development server that imports and runs the app
- **`api/index.ts`** - Vercel function entry point
- **`vercel.json`** - Vercel deployment configuration

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /status` - Server status and metrics
- `GET /swagger` - API documentation
- `POST /api/google/reverse-image` - Reverse image search
- `GET /api/gnews/search` - News article search
- `GET /api/gnews/top-headlines` - Top headlines
- `GET /api/google/cse` - Google Custom Search
- `GET /api/google/youtube/search` - YouTube video search
