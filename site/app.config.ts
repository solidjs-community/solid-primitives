import { defineConfig } from "@solidjs/start/config";

const packages = await (async () => {
  try {
    // @ts-ignore
    return (await import("./src/_generated/packages.json")).default;
  } catch (e) {
    throw new Error("No packages found. Did you run `pnpm generate`?");
  }
})();

export default defineConfig({
  vite: {
    resolve: {
      // use files in packages src dir
      conditions: ["@solid-primitives/source"],
    },
  },
  server: {
    prerender: {
      routes: [
        "/",
        ...packages.flatMap(({ name }: { name: string }) => [
          `/package/${name}`,
          `/playground/${name}`,
        ]),
      ],
    },
  },
});
