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

import { NextRequest } from "next/server";

export async function GET() {
  return new Response("ok", { status: 200 });
}

export async function HEAD(request: NextRequest) {
  try {
    const headers = Object.fromEntries(request.headers.entries());

    return Response.json({
      headers,
      status: 200,
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response("GET, OPTIONS, HEAD", { status: 200 });
}
