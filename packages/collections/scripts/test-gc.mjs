// Build the weak collection lifetime tests in both shipped Solid profiles.
import { build } from "esbuild";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const path = relative => fileURLToPath(new URL(relative, import.meta.url));
const cache = path("../node_modules/.cache/collections-gc/");
await mkdir(cache, { recursive: true });

for (const dev of [true, false]) {
  const outfile = `${cache}/weak-${dev ? "development" : "production"}.mjs`;
  await build({
    entryPoints: [path("../test/integration/gc/weak-collections.test.ts")],
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    // Exercise the shipped client builds, including in this Node GC process.
    conditions: ["browser", ...(dev ? ["development"] : [])],
  });
  process.stdout.write(`Weak collection GC (${dev ? "development" : "production"})\n`);
  const result = spawnSync(process.execPath, ["--expose-gc", outfile], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
