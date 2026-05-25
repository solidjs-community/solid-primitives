import type { StorybookConfig } from "storybook-solidjs-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../packages/*/stories/*.stories.{ts,tsx}"],
  staticDirs: [{ from: "../packages/audio/stories/assets", to: "/audio" }],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "storybook-solidjs-vite",
    options: {},
  },
  docs: {},
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [
        // babel-preset-solid <beta.14 generates `addEventListener` but @solidjs/web@beta.14
        // renamed it to `addEvent`. Patch any compiled story that uses the old import.
        {
          name: "solid-addEventListener-compat",
          transform(code: string, id: string) {
            if (/\.(tsx?|jsx?)$/.test(id) && code.includes("addEventListener as _$addEventListener")) {
              return {
                code: code.replace(
                  /\{ addEventListener as _\$addEventListener \}/g,
                  "{ addEvent as _$addEventListener }",
                ),
                map: null,
              };
            }
          },
        },
      ],
      resolve: {
        conditions: ["@solid-primitives/source"],
        // solid-js 2.0 removed the ./web subpath — redirect any lingering imports
        // (e.g. from storybook-solidjs-vite's Solid 1.x code path) to @solidjs/web.
        alias: [{ find: "solid-js/web", replacement: "@solidjs/web" }],
      },
    });
  },
};

export default config;
