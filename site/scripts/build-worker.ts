// Bundles worker/index.ts into dist/client/_worker.js, the Worker entry wrangler.jsonc points at
// (`main`). public/.assetsignore keeps it out of the uploaded static assets. Runs after
// `vite build`.
import * as fs from "node:fs";
import * as path from "node:path";
import { build } from "esbuild";

const siteDir = path.resolve(import.meta.dirname, "..");
const clientDir = path.join(siteDir, "dist/client");
const outfile = path.join(clientDir, "_worker.js");

if (!fs.existsSync(clientDir)) {
  throw new Error("dist/client not found — run `vite build` before building the worker.");
}

await build({
  entryPoints: [path.join(siteDir, "worker/index.ts")],
  outfile,
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  conditions: ["workerd", "worker", "browser"],
  mainFields: ["module", "main"],
  minify: true,
  legalComments: "none",
  logLevel: "info",
});

const kb = (fs.statSync(outfile).size / 1024).toFixed(1);
// oxlint-disable-next-line no-console
console.log(`Worker bundled: ${path.relative(siteDir, outfile)} (${kb} KB)`);
