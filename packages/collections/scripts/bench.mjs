// Bundle shipped production dependencies so module-runner export getters do not
// dominate collection operations. The benchmark entry reports time per operation.
import { build } from "esbuild";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const path = relative => fileURLToPath(new URL(relative, import.meta.url));
const cache = path("../node_modules/.cache/collections-bench/");
await mkdir(cache, { recursive: true });
const outfile = `${cache}/production.mjs`;
await build({
  entryPoints: [path("../test/integration/collections.bench.ts")],
  outfile,
  bundle: true,
  platform: "node",
  format: "esm",
  tsconfigRaw: { compilerOptions: {} },
  conditions: ["browser"],
  logLevel: "error",
});
const result = spawnSync(process.execPath, [outfile], { stdio: "inherit" });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
