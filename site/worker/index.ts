/**
 * Cloudflare Worker for the docs site (static assets + this Worker; see wrangler.jsonc). Bundled to
 * `dist/client/_worker.js` by scripts/build-worker.ts.
 *
 * The site itself is fully static (prerendered pages and pre-rendered OG images in `dist/client`).
 * The only dynamic path is `/api/stats`: fresh homepage numbers (npm downloads, open issues/PRs),
 * refreshed at most once a day. `assets.run_worker_first` in wrangler.jsonc limits the Worker to
 * `/api/*`, so every other request is answered from static assets without invoking it.
 *
 * If a refresh fails, the endpoint answers 502 (cached for an hour, so visitors don't each retry
 * the ~100 upstream requests) and the homepage keeps the numbers baked in at build time.
 *
 * Plan limits worth knowing: a refresh makes ~100 subrequests (one npm lookup per package plus two
 * GitHub searches). Workers allow 50 per invocation on the free plan and 1,000 on paid, so on the
 * free plan this always fails soft and the homepage shows its build-time numbers.
 */
import { packageNames } from "../src/generated/packages";
import { fetchProjectStats, type ProjectStats } from "../src/lib/project-stats";

type Env = {
  /** Static assets of the deployment (`dist/client`). */
  ASSETS: { fetch(request: Request): Promise<Response> };
  /** Optional. Avoids sharing GitHub's unauthenticated search budget with other clients. */
  SITE_GITHUB_TOKEN?: string;
};

type Context = { waitUntil(promise: Promise<unknown>): void };

const DAY_SECONDS = 24 * 60 * 60;
const RETRY_SECONDS = 60 * 60;

/** Concurrent callers on one isolate share one refresh. */
let refreshing: Promise<ProjectStats> | undefined;

function json(body: unknown, status: number, maxAge: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${maxAge}`,
    },
  });
}

async function stats(request: Request, env: Env, ctx: Context): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  // `caches.default` is Cloudflare's per-data-centre cache; it isn't in the standard CacheStorage
  // typings.
  const cache = (caches as unknown as { default: Cache }).default;
  const key = new Request(new URL("/api/stats", request.url).href);
  const hit = await cache.match(key);
  if (hit) return hit;

  let response: Response;
  try {
    refreshing ??= fetchProjectStats(packageNames, { githubToken: env.SITE_GITHUB_TOKEN }).finally(
      () => {
        refreshing = undefined;
      },
    );
    response = json(await refreshing, 200, DAY_SECONDS);
  } catch (err) {
    // oxlint-disable-next-line no-console
    console.warn(`[stats] refresh failed: ${err}`);
    response = json({ error: "Project stats unavailable" }, 502, RETRY_SECONDS);
  }
  ctx.waitUntil(cache.put(key, response.clone()));
  return response;
}

export default {
  async fetch(request: Request, env: Env, ctx: Context): Promise<Response> {
    if (new URL(request.url).pathname === "/api/stats") return stats(request, env, ctx);
    return env.ASSETS.fetch(request);
  },
};
