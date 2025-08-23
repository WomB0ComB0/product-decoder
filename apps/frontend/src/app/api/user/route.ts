import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Temporarily return a simple response while we fix the auth issue
    return NextResponse.json({ user: null, message: "Auth temporarily disabled" });
  } catch (error) {
    console.error("Error in user route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
