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
    alias: {
      "@solidjs/signals": path("../../../../solid/packages/signals/src/index.ts"),
      "solid-js": path("../../../../solid/packages/solid/src/index.ts"),
      "solid-js/internal": path("../../../../solid/packages/solid/src/internal.ts"),
      "@solidjs/web": path("../../../../solid/packages/web/src/index.ts"),
    },
    // Internal invariant registries intentionally retain companion owners.
    define: { __DEV__: String(dev), __OBSERVE__: String(dev), __TEST__: "false" },
  });
  process.stdout.write(`Weak collection GC (${dev ? "development" : "production"})\n`);
  const result = spawnSync(process.execPath, ["--expose-gc", outfile], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
