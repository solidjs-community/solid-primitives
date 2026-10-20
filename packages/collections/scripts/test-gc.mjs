// Build collection lifetime tests in both shipped Solid profiles.
import { build } from "esbuild";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const path = relative => fileURLToPath(new URL(relative, import.meta.url));
const cache = path("../node_modules/.cache/collections-gc/");
await mkdir(cache, { recursive: true });

for (const dev of [true, false]) {
  for (const suite of ["collections", "weak-collections"]) {
    const outfile = `${cache}/${suite}-${dev ? "development" : "production"}.mjs`;
    await build({
      entryPoints: [path(`../test/integration/gc/${suite}.test.ts`)],
      outfile,
      bundle: true,
      platform: "node",
      format: "esm",
      // Linked dependencies may map imports to source in their tsconfig. These
      // lifetime checks must bundle their shipped builds instead.
      tsconfigRaw: { compilerOptions: {} },
      // Exercise the shipped client builds, including in this Node GC process.
      conditions: ["browser", ...(dev ? ["development"] : [])],
    });
    process.stdout.write(`${suite} GC (${dev ? "development" : "production"})\n`);
    const result = spawnSync(process.execPath, ["--expose-gc", outfile], { stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}
