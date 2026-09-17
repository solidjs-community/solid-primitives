// Local integration against the sibling Solid 2 checkout until the required
// release is adopted by the workspace. No changes to Solid's shared harness.
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { transformAsync } from "@babel/core";
const require = createRequire(import.meta.url);
const babelSolid = require("../../../solid/packages/babel-plugin/index.js");
const source = (path: string) =>
  fileURLToPath(new URL(`../../../solid/packages/${path}`, import.meta.url));
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
  define: {
    __DEV__: String(mode !== "benchmark"),
    __OBSERVE__: String(mode !== "benchmark"),
    __TEST__: String(mode !== "benchmark"),
  },
  resolve: {
    conditions: ["@solid-primitives/source", mode === "ssr" ? "node" : "browser", "development"],
    alias: [
      { find: /^@solidjs\/signals$/, replacement: source("signals/src/index.ts") },
      {
        find: /^solid-js$/,
        replacement: source(mode === "ssr" ? "solid/src/server/index.ts" : "solid/src/index.ts"),
      },
      { find: /^solid-js\/internal$/, replacement: source("solid/src/internal.ts") },
      {
        find: /^@solidjs\/web$/,
        replacement: source(mode === "ssr" ? "web/src/index.server.ts" : "web/src/index.ts"),
      },
      {
        find: /^@solidjs\/web\/serialization$/,
        replacement: source("web/serialization/src/serializer.ts"),
      },
      {
        find: /^@solidjs\/web\/serialization\/decode$/,
        replacement: source("web/serialization/src/serializer-decode.ts"),
      },
      { find: /^collection-test-server$/, replacement: source("solid/src/server/index.ts") },
      {
        find: /^collection-test-server-signals$/,
        replacement: source("solid/src/server/signals.ts"),
      },
    ],
  },
  test: {
    include:
      mode === "ssr"
        ? [
            "test/integration/collections-server.test.ts",
            "test/integration/collections-render.test.tsx",
            "test/integration/weak-render.test.tsx",
          ]
        : ["test/integration/*.test.{ts,tsx}"],
    exclude:
      mode === "ssr"
        ? []
        : [
            "test/integration/collections-server.test.ts",
            "test/integration/collections-render.test.tsx",
            "test/integration/weak-render.test.tsx",
          ],
    // Codec lifetime checks require real GC in an isolated process.
    pool: "forks",
    poolOptions: { forks: { execArgv: ["--expose-gc"] } },
    maxWorkers: 1,
    minWorkers: 1,
    benchmark: { include: ["test/integration/collections.bench.ts"] },
  },
}));
