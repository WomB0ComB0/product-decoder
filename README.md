<!--
  product-decoder

  Copyright 2025 Product Decoder

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

# Product Decoder

Product Decoder is a monorepo that provides a visual product recognition and metadata extraction experience: upload a product photo and receive nutrition facts, price history, store availability, and other structured information.

This repository includes a Next.js frontend, a Bun-based backend, a small shared package set, and a Prisma-powered database layer.

## Quick overview
- Frontend: `apps/frontend` — Next.js (App Router), TypeScript, Tailwind CSS, UI components and the image upload flow.
- Backend: `apps/backend` — Bun-powered API and server utilities.
- Database: `db` — Prisma schema and seeds.
- Shared: `shared` — shared types, utilities and small packages used across apps.
- Packages: monorepo helper packages and tooling under `packages/`.

## Features
- Upload product images (drag & drop or file select).
- Image analysis pipeline.
- Dashboard UI for authenticated users.
- Monorepo layout with reusable shared code.

## Tech stack
- Next.js (App Router) + TypeScript
- Bun
- Tailwind CSS for styling
- Prisma for database schema & migrations
- Clerk for auth (used in dashboard layout)
- Vitest for unit tests (shared package)

## Prerequisites
- Bun (recommended, repository contains `bun.lock`)
- Git
- Node (optional, some scripts may use `node`/`npx`)

Install Bun: https://bun.sh/

## Local development
1. Install dependencies from the repo root:

```bash
bun install
```

2. Run the frontend:

```bash
cd apps/frontend
bun run dev
```

3. Run the backend:

```bash
cd apps/backend
bun run dev
```

Notes:
- Environment files: several apps expect environment variables or credential files. Copy or populate the example credential files before starting the backend.

