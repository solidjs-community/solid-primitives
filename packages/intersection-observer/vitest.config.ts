import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";

// solid-js 2.0 removed the "solid-js/web" sub-package in favour of "@solidjs/web".
// @solid-primitives/utils still imports from "solid-js/web", so alias it here until
// that package is upgraded.
export default defineConfig(({ mode }) => {
  const testSSR = mode === "test:ssr" || mode === "ssr";

  return {
    plugins: [
      solidPlugin({
        hot: false,
        solid: { generate: testSSR ? "ssr" : "dom", omitNestedClosingTags: false },
      }),
    ],
    resolve: {
      conditions: testSSR
        ? ["@solid-primitives/source", "node"]
        : ["@solid-primitives/source", "browser", "development"],
      alias: {
        "solid-js/web": new URL(
          testSSR
            ? "./node_modules/@solidjs/web/dist/server.js"
            : "./node_modules/@solidjs/web/dist/web.js",
          import.meta.url,
        ).pathname,
      },
    },
    test: {
      watch: false,
      isolate: false,
      passWithNoTests: true,
      environment: testSSR ? "node" : "jsdom",
      transformMode: {
        web: [/\.[jt]sx$/],
      },
      ...(testSSR
        ? { include: ["test/server.test.{ts,tsx}"] }
        : {
            include: ["test/*.test.{ts,tsx}"],
            exclude: ["test/server.test.{ts,tsx}"],
          }),
    },
  };
});
