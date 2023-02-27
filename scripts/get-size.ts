import { build } from "esbuild";
import { readFileSync } from "fs";
import { gzipSizeSync } from "gzip-size";
import { formatBytes } from "./utils";

const run = async () => {
  await build({
    entryPoints: ["./packages/stream/src/index.ts"],
    outfile: "./dist/main.js",
    target: ["esnext"],
    format: "esm",
    bundle: true,
    minify: true,
    treeShaking: true,
    platform: "browser",
    external: ["solid-js"]
  });
  const buffer = readFileSync("./dist/main.js");
  const minifiedSize = buffer.toString().length;
  const gzippedSize = gzipSizeSync(buffer);

  console.log(formatBytes(minifiedSize), formatBytes(gzippedSize));
};
run();
