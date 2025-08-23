import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ message: "Auth temporarily disabled" });
}

export async function POST() {
  return NextResponse.json({ message: "Auth temporarily disabled" });
}

export async function HEAD() {
  return NextResponse.json({ message: "Auth temporarily disabled" });
}

export async function OPTIONS() {
  return new Response("GET, POST, OPTIONS, HEAD", { status: 200 });
}
