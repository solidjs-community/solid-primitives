// Build collection lifetime tests in both shipped Solid profiles.
import { build } from "esbuild";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const path = relative => fileURLToPath(new URL(relative, import.meta.url));
const cacheRoot = path("../node_modules/.cache/");
await mkdir(cacheRoot, { recursive: true });
const cache = await mkdtemp(cacheRoot + "collections-gc-");
try {
  profiles: for (const dev of [true, false]) {
    for (const suite of ["collections", "weak-collections", "weak-server"]) {
      const outfile = `${cache}/${suite}-${dev ? "development" : "production"}.mjs`;
      await build({
        entryPoints: [path(`../test/gc/${suite}.test.ts`)],
        outfile,
        bundle: true,
        platform: "node",
        format: "esm",
        // Linked dependencies may map imports to source in their tsconfig. These
        // lifetime checks must bundle their shipped builds instead.
        tsconfigRaw: { compilerOptions: {} },
        // Exercise shipped client and server builds in isolated Node processes.
        conditions: [suite === "weak-server" ? "node" : "browser", ...(dev ? ["development"] : [])],
      });
      process.stdout.write(`${suite} GC (${dev ? "development" : "production"})\n`);
      const result = spawnSync(process.execPath, ["--expose-gc", outfile], { stdio: "inherit" });
      if (result.error) throw result.error;
      if (result.status !== 0) {
        process.exitCode = result.status ?? 1;
        break profiles;
      }
    }
  }
} finally {
  await rm(cache, { recursive: true, force: true });
}
