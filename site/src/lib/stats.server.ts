import { respond } from "@solidjs/web";
import { GET } from "@solidjs/web/server-functions";
import { packageNames } from "../generated/packages";
import { fetchProjectStats, type ProjectStats } from "./project-stats";

/**
 * Fresh homepage stats, refreshed at most once a day.
 *
 * Two cache layers:
 * - In memory, for the life of the server process: one GitHub/npm refresh (~100 requests) a day,
 *   however many visitors ask. Concurrent callers share one in-flight refresh.
 * - HTTP: `Cache-Control` (`GET` server functions default to `no-store`) for the time left on the
 *   in-memory copy, so a CDN or the browser can answer without reaching the server at all.
 *
 * If a refresh fails, the last good copy is served for another hour before retrying. With no copy
 * at all, the call throws (and keeps throwing for that hour without retrying), and the homepage
 * keeps its build-time numbers.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const RETRY_MS = 60 * 60 * 1000;

let cached: { stats: ProjectStats; expires: number } | undefined;
let refreshing: Promise<void> | undefined;
/** With no good copy yet, a failure is remembered so visitors don't each retry ~100 requests. */
let failedUntil = 0;

function refresh(): Promise<void> {
  return (refreshing ??= fetchProjectStats(packageNames)
    .then(stats => {
      cached = { stats, expires: Date.now() + DAY_MS };
    })
    .catch(err => {
      // oxlint-disable-next-line no-console
      console.warn(`[stats] refresh failed: ${err}`);
      if (cached) cached.expires = Date.now() + RETRY_MS;
      else {
        failedUntil = Date.now() + RETRY_MS;
        throw err;
      }
    })
    .finally(() => {
      refreshing = undefined;
    }));
}

export const getProjectStats = GET(async (): Promise<ProjectStats> => {
  "use server";
  if (!cached && failedUntil > Date.now()) throw new Error("Project stats unavailable");
  if (!cached || cached.expires <= Date.now()) await refresh();
  const { stats, expires } = cached!;
  const maxAge = Math.max(0, Math.floor((expires - Date.now()) / 1000));
  return respond(stats, { headers: { "Cache-Control": `public, max-age=${maxAge}` } });
});
