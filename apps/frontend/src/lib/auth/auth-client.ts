import { createAuthClient } from "better-auth/react";
import { env } from "~/env/client";

const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
});

export default authClient;
