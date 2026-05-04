import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import viteSolid from "vite-plugin-solid";

const __dirname = dirname(fileURLToPath(import.meta.url));

const packages = await (async () => {
  try {
    // @ts-ignore - generated file may not exist on a fresh checkout
    return (await import("./src/_generated/packages.json", { with: { type: "json" } }))
      .default as Array<{ name: string }>;
  } catch {
    throw new Error("No packages found. Did you run `pnpm generate`?");
  }
})();

// A package only gets a prerendered `/playground/<name>` page if it has a
// runnable dev harness at `packages/<name>/dev/index.tsx`. `filesystem` is
// additionally excluded because its dev harness imports Node-only chokidar
// (mirrors the glob exclusion in src/routes/playground/$name.tsx).
const hasPlayground = (name: string) =>
  name !== "filesystem" &&
  existsSync(resolve(__dirname, "..", "packages", name, "dev", "index.tsx"));

const prerenderPages = [
  "/",
  ...packages.flatMap(({ name }) => {
    const paths = [`/package/${name}`];
    if (hasPlayground(name)) paths.push(`/playground/${name}`);
    return paths;
  }),
].map(path => ({ path, prerender: { enabled: true, crawlLinks: false } }));

export default defineConfig({
  resolve: {
    // Use the source-code entry points of the workspace `@solid-primitives/*` packages
    // instead of their published dist files (matches customConditions in tsconfig.json).
    conditions: ["@solid-primitives/source"],
    // Auto-reads `paths` from tsconfig.json — preserves `~/*` → `./src/*`.
    tsconfigPaths: true,
  },
  build: {
    sourcemap: true,
  },
  plugins: [
    tanstackStart({
      pages: prerenderPages,
      // Custom client entry installs a dev-mode `console.warn` interceptor that
      // batches the noisy "Unable to find DOM nodes for hydration key" warnings
      // emitted by the primitives table.
      client: { entry: "./src/client.tsx" },
      prerender: {
        enabled: true,
        // README content contains relative/anchor links; avoid following them.
        crawlLinks: false,
      },
    }),
    viteSolid({ ssr: true }),
  ],
});
