import { env } from "@/env/client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  apiPath: "/api/v1/auth",
});
