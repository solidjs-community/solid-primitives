// Bundle shipped production dependencies so module-runner export getters do not
// dominate collection operations. The benchmark entry reports time per operation.
import { build } from "esbuild";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const path = relative => fileURLToPath(new URL(relative, import.meta.url));
const cacheRoot = path("../node_modules/.cache/");
await mkdir(cacheRoot, { recursive: true });
const cache = await mkdtemp(cacheRoot + "collections-bench-");
try {
  const outfile = `${cache}/production.mjs`;
  await build({
    entryPoints: [path("../test/collections.bench.ts")],
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
} finally {
  await rm(cache, { recursive: true, force: true });
}
