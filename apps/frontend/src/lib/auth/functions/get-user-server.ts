import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Server-side function to get user session
export async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user || null;
}
