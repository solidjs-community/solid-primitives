import { defineConfig, Options } from "tsup";

const common: Options = {
  format: ["esm", "cjs"],
  treeshake: true,
  replaceNodeEnv: true
};

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

export function createConfig(options: { devEntry: boolean; ssrEntry: boolean }) {
  const entries: Options[] = [
    {
      ...common,
      clean: true,
      dts: "src/index.ts",
      entryPoints: ["src/index.ts"],
      ...getEnvVars("prod")
    }
  ];

  if (options.ssrEntry) {
    entries.push({
      ...common,
      entryPoints: { server: "src/index.ts" },
      ...getEnvVars("ssr")
    });
  }

  if (options.devEntry) {
    entries.push({
      ...common,
      entryPoints: { dev: "src/index.ts" },
      ...getEnvVars("dev")
    });
  }

  return defineConfig(entries);
}
