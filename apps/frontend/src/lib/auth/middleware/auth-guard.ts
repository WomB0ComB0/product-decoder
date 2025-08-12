import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Server-side function to check if user is authenticated
 * Use this in server actions or server components
 */
export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

/**
 * Server-side function to get user session (doesn't throw if not authenticated)
 * Use this in server actions or server components
 */
export async function getAuthSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}
