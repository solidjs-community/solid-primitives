/**
 * Repo-wide GitHub issue/PR counts and aggregate npm download volume for the homepage stats block.
 *
 * Shared by two callers:
 * - `scripts/generate.ts` bakes a copy into `src/generated/stats.ts` at build time, so the
 *   prerendered homepage always has numbers, even with no server behind it.
 * - `stats.server.ts` serves a fresh copy (cached for a day) that the homepage swaps in after load.
 *
 * Plain `fetch` only (no Vite or Solid imports), so the Node generate script can import it too.
 */

export type ProjectStats = {
  npmDownloadsLastMonth: number;
  npmDownloadsLastMonthFormatted: string;
  openIssues: number;
  openPullRequests: number;
  /** Display date of the fetch, e.g. "Nov 12, 2026". */
  generatedAt: string;
};

const GITHUB_API_REPO = "solidjs-community/solid-primitives";

async function githubSearchCount(query: string): Promise<number> {
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(`repo:${GITHUB_API_REPO} ${query}`)}`;
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  // Optional. Unauthenticated search allows 10 requests/minute per IP, which a daily refresh never
  // gets near; a token just avoids sharing that budget with anything else on the host. A
  // site-specific name, so an unrelated GITHUB_TOKEN in the environment isn't picked up.
  const token = typeof process !== "undefined" ? process.env.SITE_GITHUB_TOKEN : undefined;
  if (token) headers.Authorization = `Bearer ${token}`;
  let res = await fetch(url, { headers });
  if (res.status === 401 && token) {
    // A bad/expired token shouldn't cost the stats: public search works without one.
    delete headers.Authorization;
    res = await fetch(url, { headers });
  }
  if (!res.ok) throw new Error(`GitHub search "${query}" failed: HTTP ${res.status}`);
  const json = await res.json();
  if (typeof json.total_count !== "number") {
    throw new Error("Unexpected GitHub search API response shape");
  }
  return json.total_count;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * One package's downloads. An unpublished package (404) counts as 0. Anything else that fails
 * (npm's CDN rate-limits bursts with a 429) is retried, then thrown: a partial sum would publish
 * a confidently wrong total, so the whole refresh fails and the previous numbers stay.
 */
async function npmDownloadsLastMonthOf(name: string): Promise<number> {
  const url = `https://api.npmjs.org/downloads/point/last-month/@solid-primitives/${name}`;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url);
    if (res.status === 404) return 0;
    if (res.ok) {
      const json = await res.json();
      if (typeof json.downloads === "number") return json.downloads;
      throw new Error(`npm downloads for ${name}: unexpected response`);
    }
    if (attempt >= 2) throw new Error(`npm downloads for ${name} failed: HTTP ${res.status}`);
    await sleep(1000 * 2 ** attempt);
  }
}

/** Throws if GitHub or npm can't be read completely (see `npmDownloadsLastMonthOf`). */
export async function fetchProjectStats(moduleNames: readonly string[]): Promise<ProjectStats> {
  const [openIssues, openPullRequests] = await Promise.all([
    githubSearchCount("type:issue state:open"),
    githubSearchCount("type:pr state:open"),
  ]);

  // npm's bulk downloads endpoint doesn't support scoped packages, so each package
  // needs its own request — fetch in small concurrent batches to stay polite.
  let npmDownloadsLastMonth = 0;
  const BATCH_SIZE = 10;
  for (let i = 0; i < moduleNames.length; i += BATCH_SIZE) {
    const batch = moduleNames.slice(i, i + BATCH_SIZE);
    const batchDownloads = await Promise.all(batch.map(npmDownloadsLastMonthOf));
    npmDownloadsLastMonth += batchDownloads.reduce((sum, n) => sum + n, 0);
  }

  return {
    npmDownloadsLastMonth,
    // Pre-formatted so the MDX homepage only ever interpolates plain values (its CSS-extraction
    // pass chokes on non-trivial JS in the frontmatter scope).
    npmDownloadsLastMonthFormatted: new Intl.NumberFormat("en-US", { notation: "compact" }).format(
      npmDownloadsLastMonth,
    ),
    openIssues,
    openPullRequests,
    generatedAt: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date()),
  };
}
