import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";

const fromRoot = process.env.CI === "true";

export default defineConfig(({ mode }) => {
  // test in server environment
  // loads only server.test.ts file
  const testSSR = mode === "test:ssr" || mode === "ssr";

  return {
    plugins: [
      solidPlugin({
        // https://github.com/solidjs/solid-refresh/issues/29
        hot: false,
        // For testing SSR we need to do a SSR JSX transform
        solid: { generate: testSSR ? "ssr" : "dom" },
      }),
    ],
    test: {
      watch: false,
      isolate: !testSSR,
      passWithNoTests: true,
      environment: testSSR ? "node" : "jsdom",
      transformMode: {
        web: [/\.[jt]sx$/],
      },
      ...(fromRoot
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
      conditions: testSSR ? ["node"] : ["browser", "development"],
      // fix issues with stores and node@20:
      ...(!testSSR && { 
        alias: {
          "solid-js/store": "solid-js/store/dist/store.js"
        },
      }),
    },
  };
});
