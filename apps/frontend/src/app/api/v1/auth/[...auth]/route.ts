import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export const { GET, POST } = toNextJsHandler(auth.handler);

export async function HEAD() {
  try {
    return Response.json({
      headers: await headers(),
      status: 200,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response("GET, POST, OPTIONS, HEAD", { status: 200 });
}
