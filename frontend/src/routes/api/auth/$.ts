import { createServerFileRoute, getWebRequest } from "@tanstack/react-start/server";
import { auth } from "~/lib/auth";

export const ServerRoute = createServerFileRoute("/api/auth/$").methods({
  GET: ({ request }) => auth.handler(request),
  POST: ({ request }) => auth.handler(request),
  HEAD: async () => {
    try {
      const webRequest = getWebRequest();
      if (!webRequest) throw new Error("No web request available");
    //
      const { headers } = webRequest;
    //
      return Response.json({
        headers,
        status: 200,
      });
    } catch (e) {
      throw errorPredicate(new Error(), (e) => e.message ?? String(e))
    }
  },
  OPTIONS: () => new Response("GET, POST, OPTIONS, HEAD", { status: 200 })
});
