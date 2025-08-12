import { NextRequest } from "next/server";
import { auth } from "~/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { auth: string[] } }
) {
  return auth.handler(request);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { auth: string[] } }
) {
  return auth.handler(request);
}

export async function HEAD(request: NextRequest) {
  try {
    const headers = Object.fromEntries(request.headers.entries());

    return Response.json({
      headers,
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
