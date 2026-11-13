import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { transformAsync } from "@babel/core";
import babelSolid from "@solidjs/babel-plugin";
export default defineConfig(({ mode }) => ({
  root: fileURLToPath(new URL("./", import.meta.url)),
  plugins: [
    {
      name: "collection-test-jsx",
      enforce: "pre",
      async transform(code, id) {
        if (!id.endsWith(".tsx") || id.includes("node_modules")) return;
        const result = await transformAsync(code, {
          filename: id,
          configFile: false,
          babelrc: false,
          plugins: [
            [
              babelSolid,
              {
                generate: mode === "ssr" ? "ssr" : "dom",
                moduleName: "@solidjs/web",
                hydratable: true,
              },
            ],
          ],
          parserOpts: { plugins: ["jsx", "typescript"] },
        });
        return { code: result!.code!, map: result!.map };
      },
    },
  ],
  resolve: {
    conditions: ["@solid-primitives/source", mode === "ssr" ? "node" : "browser", "development"],
  },
  // Vitest evaluates inlined dependencies through Vite's SSR pipeline.
  ssr: {
    resolve: {
      conditions: ["@solid-primitives/source", mode === "ssr" ? "node" : "browser", "development"],
    },
  },
  test: {
    include:
      mode === "ssr"
        ? [
            "test/collections-server.test.ts",
            "test/collections-shallow-server.test.ts",
            "test/collections-render.test.tsx",
            "test/weak-render.test.tsx",
          ]
        : ["test/*.test.{ts,tsx}"],
    exclude:
      mode === "ssr"
        ? []
        : [
            "test/collections-server.test.ts",
            "test/collections-shallow-server.test.ts",
            "test/collections-render.test.tsx",
            "test/weak-render.test.tsx",
          ],
    // Resolve runtime exports with this suite's client/server conditions.
    server: { deps: { inline: ["solid-js", "@solidjs/signals", "@solidjs/web"] } },
    // Codec lifetime checks require real GC in an isolated process.
    pool: "forks",
    execArgv: ["--expose-gc"],
    maxWorkers: 1,
    minWorkers: 1,
  },
}));
