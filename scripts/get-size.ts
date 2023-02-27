import { build } from "esbuild";
import { readFileSync, writeFileSync, rmSync } from "fs";
import { gzipSizeSync } from "gzip-size";
import { formatBytes } from "./utils";

const run = async ({
  packageName,
  primitiveName
}: {
  packageName: string;
  primitiveName: string;
}) => {
  const file = `
export { ${primitiveName} } from "./index"
`;
  const fileName = "_temp_check_primitive.ts";
  const outDir = "./_temp_output_primitive_dir";
  const outFile = `${outDir}/main.js`;
  const packagePath = `./packages/${packageName}/src/`;
  const packageExportFilePath = `${packagePath}${fileName}`;
  writeFileSync(packageExportFilePath, file);

  await build({
    entryPoints: [packageExportFilePath],
    outfile: outFile,
    target: ["esnext"],
    format: "esm",
    bundle: true,
    minify: true,
    treeShaking: true,
    platform: "browser",
    external: ["solid-js"]
  });
  const buffer = readFileSync(outFile);
  const minifiedSize = buffer.toString().length;
  const gzippedSize = gzipSizeSync(buffer);
  rmSync(packageExportFilePath);
  rmSync(outDir, { recursive: true });

  console.log(formatBytes(minifiedSize), formatBytes(gzippedSize));
};

run({ packageName: "stream", primitiveName: "createAmplitudeStream" });
