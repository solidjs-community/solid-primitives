import path from "path";
import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";

const cwd = process.cwd();

export default defineConfig(({ mode }) => {
  // test in server environment
  // loads only server.test.ts file
  const testSSR = mode === "test:ssr" || mode === "ssr";

  return {
    plugins: [solidPlugin()],
    test: {
      watch: false,
      env: {
        NODE_ENV: testSSR ? "production" : "development",
        DEV: testSSR ? "" : "1",
        SSR: testSSR ? "1" : "",
        PROD: testSSR ? "1" : ""
      },
      globals: true,
      clearMocks: true,
      passWithNoTests: true,
      environment: testSSR ? "node" : "jsdom",
      transformMode: {
        web: [/\.[jt]sx?$/]
      },
      ...(testSSR && { include: ["server.test.{ts,tsx}"] }),
      ...(!testSSR && { exclude: ["server.test.{ts,tsx}"] }),
      dir: path.resolve(cwd, "test")
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
            conditions: ["browser", "development"]
          })
    }
  };
});
