// A short hash of the files that decide what an OG card looks like. Used (a) by vite.config.ts,
// which exposes it to the client as `__OG_VERSION__`, and (b) by scripts/static-og.ts when naming
// the rendered files, so both produce the same `/og/<hash>.png` paths (src/lib/og-path.ts).
import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

const componentsDir = path.resolve(import.meta.dirname, "../src/components");
const FILES = ["OpenGraph.tsx", "og-assets.ts", "og-fonts.ts"];

export function ogVersion(): string {
  const hash = crypto.createHash("sha256");
  for (const file of FILES) hash.update(fs.readFileSync(path.join(componentsDir, file)));
  return hash.digest("hex").slice(0, 8);
}
