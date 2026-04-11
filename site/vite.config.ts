import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import viteSolid from "vite-plugin-solid";

const packages = await (async () => {
  try {
    // @ts-ignore - generated file may not exist on a fresh checkout
    return (await import("./src/_generated/packages.json", { with: { type: "json" } }))
      .default as Array<{ name: string }>;
  } catch {
    throw new Error("No packages found. Did you run `pnpm generate`?");
  }
})();

const prerenderPages = [
  "/",
  ...packages.flatMap(({ name }) => [`/package/${name}`, `/playground/${name}`]),
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
