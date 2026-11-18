// Renders every Open Graph card at build time. Runs after `vite build`.
//
// `<DynamicImage>` (src/components/OpenGraph.tsx) compiles into GET server functions, so every
// prerendered page's og:image / twitter:image tag points at a `/_server/data/…` URL that renders a
// PNG on request. Static hosting has no server for that, so this script:
//
//   1. finds those URLs in dist/client/**/*.html,
//   2. requests each one from the built server bundle (dist/server/server.js) in-process,
//   3. saves the PNG under the path `ogStaticPath()` gives it (src/lib/og-path.ts: a hash of the
//      render URL and of the card source files, so it is immutable-cacheable, and the client,
//      which computes the same path itself, always agrees with the file), and
//   4. rewrites the tags to that static file, keeping each page's own origin (production domain,
//      or a preview deployment's URL).
//
// It fails the build if any card can't be rendered or any `/_server` reference is left behind:
// a missing preview image is better caught here than found in a social-media card later.
import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { ogStaticPath } from "../src/lib/og-path.js";
import { ogVersion } from "./og-version.js";

const siteDir = path.resolve(import.meta.dirname, "..");
const clientDir = path.join(siteDir, "dist/client");
const serverEntry = path.join(siteDir, "dist/server/server.js");
const ogDir = path.join(clientDir, "og");
const CONCURRENCY = 4;

// content="<origin>/_server/data/DynamicImage1ServerFunction-<hash>?args=…"
const IMAGE_URL =
  /content="([^"]*?)(\/_server\/data\/DynamicImage\d+ServerFunction-[A-Za-z0-9]+\?[^"]*)"/g;

function* htmlFiles(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith(".html")) yield full;
  }
}

if (!fs.existsSync(clientDir) || !fs.existsSync(serverEntry)) {
  throw new Error("dist/client or dist/server is missing — run `vite build` first.");
}

const { default: server } = (await import(pathToFileURL(serverEntry).href)) as {
  default: { fetch(request: Request): Promise<Response> };
};

// 1. Collect every distinct image URL (path + query, HTML-unescaped) across all pages.
const files = [...htmlFiles(clientDir)];
const wanted = new Set<string>();
for (const file of files) {
  for (const match of fs.readFileSync(file, "utf8").matchAll(IMAGE_URL)) {
    wanted.add(match[2]!.replaceAll("&amp;", "&"));
  }
}
if (wanted.size === 0) {
  throw new Error("No /_server OG image URLs found in dist/client — did the og tags change?");
}

// 2 + 3. Render and save.
fs.mkdirSync(ogDir, { recursive: true });
const staticPath = new Map<string, string>();
const failures: string[] = [];

const version = ogVersion();
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MIN_BYTES = 20_000;

async function render(pathAndQuery: string): Promise<void> {
  try {
    const res = await server.fetch(new Request(new URL(pathAndQuery, "http://localhost")));
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!type.startsWith("image/png")) throw new Error(`unexpected content-type "${type}"`);
    const bytes = Buffer.from(await res.arrayBuffer());
    // A blank or error image would still be a 200 PNG, so check what actually came back.
    if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error("not a PNG");
    if (bytes.length < MIN_BYTES) throw new Error(`suspiciously small (${bytes.length} bytes)`);
    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);
    if (width !== 1200 || height !== 630) throw new Error(`unexpected size ${width}x${height}`);
    const publicPath = ogStaticPath(pathAndQuery, version);
    fs.writeFileSync(path.join(clientDir, publicPath), bytes);
    staticPath.set(pathAndQuery, publicPath);
  } catch (err) {
    failures.push(`${pathAndQuery.slice(0, 140)}…  ${err}`);
  }
}

const queue = [...wanted];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let next = queue.shift(); next !== undefined; next = queue.shift()) await render(next);
  }),
);

if (new Set(staticPath.values()).size !== staticPath.size) {
  throw new Error(
    "Two different OG cards hashed to the same static path (see src/lib/og-path.ts).",
  );
}

if (failures.length > 0) {
  throw new Error(`${failures.length} OG image(s) failed to render:\n  ${failures.join("\n  ")}`);
}

// 4. Point the tags at the static files.
let rewritten = 0;
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const next = html.replace(IMAGE_URL, (_all, origin: string, pathAndQuery: string) => {
    rewritten++;
    return `content="${origin}${staticPath.get(pathAndQuery.replaceAll("&amp;", "&"))}"`;
  });
  if (next !== html) fs.writeFileSync(file, next);
}

const leftover = files.filter(f => fs.readFileSync(f, "utf8").includes("/_server/"));
if (leftover.length > 0) {
  throw new Error(
    `/_server references remain in: ${leftover.map(f => path.relative(clientDir, f)).join(", ")}`,
  );
}

const unique = new Set(staticPath.values()).size;
// oxlint-disable-next-line no-console
console.log(
  `Rendered ${wanted.size} OG card(s) → ${unique} unique image(s) in dist/client/og; ` +
    `rewrote ${rewritten} tag(s) across ${files.length} page(s).`,
);
