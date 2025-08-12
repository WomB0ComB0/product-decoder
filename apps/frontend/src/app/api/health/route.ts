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
