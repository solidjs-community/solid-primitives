import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { transformAsync } from "@babel/core";
const require = createRequire(import.meta.url);
const babelSolid = require("babel-preset-solid");
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
          presets: [
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
    conditions: [
      "@solid-primitives/source",
      mode === "ssr" ? "node" : "browser",
      ...(mode === "benchmark" ? [] : ["development"]),
    ],
  },
  test: {
    include:
      mode === "ssr"
        ? [
            "test/integration/collections-server.test.ts",
            "test/integration/collections-shallow-server.test.ts",
            "test/integration/collections-render.test.tsx",
            "test/integration/weak-render.test.tsx",
          ]
        : ["test/integration/*.test.{ts,tsx}"],
    exclude:
      mode === "ssr"
        ? []
        : [
            "test/integration/collections-server.test.ts",
            "test/integration/collections-shallow-server.test.ts",
            "test/integration/collections-render.test.tsx",
            "test/integration/weak-render.test.tsx",
          ],
    // Resolve runtime exports with this suite's client/server conditions.
    server: { deps: { inline: ["solid-js", "@solidjs/signals", "@solidjs/web"] } },
    // Codec lifetime checks require real GC in an isolated process.
    pool: "forks",
    poolOptions: { forks: { execArgv: ["--expose-gc"] } },
    maxWorkers: 1,
    minWorkers: 1,
    benchmark: { include: ["test/integration/collections.bench.ts"] },
  },
}));
