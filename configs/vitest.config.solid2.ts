import { defineConfig } from "vitest/config";
import type { Plugin } from "vite";
import * as utils from "../scripts/utils/index.js";

function solidBabelPlugin(testSSR: boolean): Plugin {
  return {
    name: "solid-babel-transform",
    config() {
      return { esbuild: { jsx: "preserve" } };
    },
    async transform(source, id) {
      if (!/\.[mc]?[tj]sx$/i.test(id) || /node_modules/.test(id)) return null;
      id = id.replace(/\?.*$/, "");

      const { transformAsync } = await import("@babel/core");
      const babelSolid = (await import("babel-preset-solid")).default;

      const parserPlugins: string[] = ["jsx"];
      if (/\.[mc]?tsx$/i.test(id)) parserPlugins.push("typescript");

      const result = await transformAsync(source, {
        filename: id,
        sourceFileName: id,
        presets: [
          [
            babelSolid,
            {
              moduleName: "@solidjs/web",
              generate: testSSR ? "ssr" : "dom",
              omitNestedClosingTags: false,
            },
          ],
        ],
        plugins: [],
        ast: false,
        sourceMaps: true,
        configFile: false,
        babelrc: false,
        parserOpts: { plugins: parserPlugins as any },
      });

      if (!result || !result.code) return null;
      return { code: result.code, map: result.map };
    },
  };
}

const package_name = utils.getPackageNameFromCWD();

if (package_name == null) {
  utils.log_info("Testing ALL packages (Solid 2.0 mode)...");
} else {
  utils.log_info("Testing " + package_name + " package (Solid 2.0 mode)...");
}

const from_root = package_name == null;

export default defineConfig(({ mode }) => {
  const testSSR = mode === "test:ssr" || mode === "ssr";

  return {
    plugins: [solidBabelPlugin(testSSR)],
    test: {
      watch: false,
      isolate: false,
      passWithNoTests: true,
      environment: testSSR ? "node" : "jsdom",
      transformMode: {
        web: [/\.[jt]sx$/],
      },
      ...(from_root
        ? // Testing all packages from root
          {
            ...(testSSR && { include: ["packages/*/test/server.test.{ts,tsx}"] }),
            ...(!testSSR && {
              include: ["packages/*/test/*.test.{ts,tsx}"],
              exclude: ["packages/*/test/server.test.{ts,tsx}"],
            }),
          }
        : // Testing a single package
          {
            ...(testSSR && { include: ["test/server.test.{ts,tsx}"] }),
            ...(!testSSR && {
              include: ["test/*.test.{ts,tsx}"],
              exclude: ["test/server.test.{ts,tsx}"],
            }),
          }),
    },
    resolve: {
      conditions: testSSR
        ? ["@solid-primitives/source", "node"]
        : ["@solid-primitives/source", "browser", "development"],
    },
  };
});
