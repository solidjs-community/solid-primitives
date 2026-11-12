// Serves the Solid server-function endpoint (`/_server/*`) on Netlify: the OG card images
// (src/components/OpenGraph.tsx) and the homepage's live stats (src/lib/stats.server.ts).
// Pages stay static in site/dist/client; only this path reaches a function.
//
// dist/server/server.js is the `vite build` server bundle (kept because vite.config.ts enables
// `serverFunctions`); its default export is a `{ fetch(request) }` handler.
import handler from "../../dist/server/server.js";

export default async request => {
  const response = await handler.fetch(request);

  // Both endpoints send a public Cache-Control (images: immutable for a year, stats: the time left
  // on the day's copy). Mirror it for Netlify's CDN with `durable` so every edge shares one cached
  // copy instead of each cold function instance regenerating it (the stats' in-memory cache is
  // per instance).
  const cacheControl = response.headers.get("cache-control");
  if (
    cacheControl &&
    /\bpublic\b/.test(cacheControl) &&
    !response.headers.has("netlify-cdn-cache-control")
  ) {
    const headers = new Headers(response.headers);
    headers.set("Netlify-CDN-Cache-Control", `${cacheControl}, durable`);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
  return response;
};

export const config = { path: "/_server/*" };
