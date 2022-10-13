import { defineConfig, Options } from "tsup";

const getEnvVars = (mode: "dev" | "prod" | "ssr"): Options => ({
  esbuildOptions(options) {
    options.define = {
      ...options.define,
      "process.env.PROD": mode === "dev" ? '""' : '"1"',
      "process.env.DEV": mode === "dev" ? '"1"' : '""',
      "process.env.SSR": mode === "ssr" ? '"1"' : '""'
    };
  }
});

export function createConfig({
  ssrEntry,
  devEntry
}: { devEntry?: boolean; ssrEntry?: boolean } = {}) {
  const common: Options = {
    format: ["esm", "cjs"],
    treeshake: true,
    replaceNodeEnv: true,
    onSuccess: printInstrunctions
  };

  const entries: Options[] = [
    {
      ...common,
      clean: true,
      dts: "src/index.ts",
      entryPoints: ["src/index.ts"],
      ...getEnvVars("prod")
    }
  ];

  if (ssrEntry) {
    entries.push({
      ...common,
      entryPoints: { server: "src/index.ts" },
      ...getEnvVars("ssr")
    });
  }

  if (devEntry) {
    entries.push({
      ...common,
      entryPoints: { dev: "src/index.ts" },
      ...getEnvVars("dev")
    });
  }

  let buildsToComplete = entries.length;

  async function printInstrunctions() {
    if (process.env.CI) return;

    if (--buildsToComplete > 0) return;

    const instructions = {
      type: "module",
      main: ssrEntry ? "./dist/server.cjs" : "./dist/index.cjs",
      module: "./dist/index.js",
      types: "./dist/index.d.ts",
      exports: {
        browser: {
          ...(devEntry && {
            development: {
              import: "./dist/dev.js",
              require: "./dist/dev.cjs"
            }
          }),
          import: "./dist/index.js",
          require: "./dist/index.cjs"
        },
        ...(ssrEntry && {
          node: {
            import: "./dist/server.js",
            require: "./dist/server.cjs"
          }
        }),
        ...(devEntry && {
          development: {
            import: "./dist/dev.js",
            require: "./dist/dev.cjs"
          }
        }),
        import: "./dist/index.js",
        require: "./dist/index.cjs"
      }
    };

    console.log(
      `\npackage.json exports should look like this:\n\n${JSON.stringify(instructions, null, 2)}\n`
    );
  }

  return defineConfig(entries);
}
