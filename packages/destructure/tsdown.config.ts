// tsdown.config.ts
import { defineConfig } from "tsdown";
import solid from "unplugin-solid/rolldown";

export default defineConfig({
  entry: 'src/**/*.{ts,tsx}',
  outDir: "dist",
  format: ["esm"],
  target: "esnext",
  platform: "neutral",
  dts: true,
  clean: true,
  unbundle: true,

  plugins: [
    solid({
      solid: {
        generate: "dom",
        hydratable: false,
      },
    }),
  ],

  deps: {
    skipNodeModulesBundle: true
  }
});