import path from "path";
import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";

const cwd = process.cwd();
const fromRoot = process.env.CI === "true";

export default defineConfig(({ mode }) => {
  // test in server environment
  // loads only server.test.ts file
  const testSSR = mode === "test:ssr" || mode === "ssr";

  return {
    plugins: [solidPlugin()],
    test: {
      watch: false,
      isolate: !testSSR,
      env: {
        NODE_ENV: testSSR ? "production" : "development",
        DEV: testSSR ? "" : "1",
        SSR: testSSR ? "1" : "",
        PROD: testSSR ? "1" : ""
      },
      passWithNoTests: true,
      environment: testSSR ? "node" : "jsdom",
      transformMode: {
        web: [/\.[jt]sx$/]
      },
      ...(fromRoot
        ? // Testing all packages from root
          {
            ...(testSSR && { include: ["packages/*/test/server.test.{ts,tsx}"] }),
            ...(!testSSR && {
              include: ["packages/*/test/*.test.{ts,tsx}"],
              exclude: ["packages/*/test/server.test.{ts,tsx}"]
            })
          }
        : // Testing a single package
          {
            ...(testSSR && { include: ["test/server.test.{ts,tsx}"] }),
            ...(!testSSR && {
              include: ["test/*.test.{ts,tsx}"],
              exclude: ["test/server.test.{ts,tsx}"]
            })
          })
    },
    resolve: {
      ...(testSSR
        ? {
            alias: {
              "solid-js/web": path.resolve(cwd, "node_modules/solid-js/web/dist/server.js"),
              "solid-js/store": path.resolve(cwd, "node_modules/solid-js/store/dist/server.js"),
              "solid-js": path.resolve(cwd, "node_modules/solid-js/dist/server.js")
            }
          }
        : {
            conditions: ["browser", "development"],
            alias: {
              "solid-js/web": path.resolve(cwd, "node_modules/solid-js/web/dist/dev.js"),
              "solid-js/store": path.resolve(cwd, "node_modules/solid-js/store/dist/dev.js"),
              "solid-js": path.resolve(cwd, "node_modules/solid-js/dist/dev.js")
            }
          })
    }
  };
});
