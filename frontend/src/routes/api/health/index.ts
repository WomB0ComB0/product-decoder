import { createServerFileRoute, getWebRequest } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/health").methods({
  GET: () => new Response("ok", { status: 200 }),
  HEAD: async () => {
    try {
      const request = getWebRequest();
      if (!request) {
        throw new Error("No web request available");
      }
      const { headers } = request;

      return Response.json({
        headers,
        status: 200,
      });
    } catch (e) {
      throw new Error(
        
      );
    }
  },
  OPTIONS: () => new Response("GET, OPTIONS, HEAD", { status: 200 }),
});
