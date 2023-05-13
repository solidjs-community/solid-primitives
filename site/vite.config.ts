import { defineConfig } from "vite";
import devtools from "solid-devtools/vite";
import solid from "solid-start/vite";
// @ts-ignore
import staticAdapter from "solid-start-static";

const packages = await (async () => {
  try {
    return (await import("./src/_generated/packages.json")).default;
  } catch (e) {
    throw new Error("No packages found. Did you run `pnpm generate`?");
  }
})();

export default defineConfig(() => {
  return {
    plugins: [
      devtools({
        autoname: true,
        locator: {
          componentLocation: true,
          targetIDE: "vscode",
        },
      }),
      solid({
        adapter: staticAdapter(),
        prerenderRoutes: [
          "/",
          ...packages.flatMap(({ name }) => [`/package/${name}`, `/playground/${name}`]),
        ],
      }),
    ],
  };
});
