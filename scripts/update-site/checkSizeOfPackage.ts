import { build } from "esbuild";
import { readFileSync, writeFileSync, rmSync } from "fs";
import { gzipSizeSync } from "gzip-size";
import { formatBytes } from "../utils";

const checkSizeOfPackage = async ({
  type,
  packageName,
  primitiveName
}: {
  type: "package" | "export";
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
  const packageIndexPath = `${packagePath}/index.ts`;
  const packageExportFilePath = `${packagePath}${fileName}`;
  if (type === "export") {
    writeFileSync(packageExportFilePath, file);
  }

  await build({
    entryPoints: [type === "package" ? packageIndexPath : packageExportFilePath],
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
  if (type === "export") {
    rmSync(packageExportFilePath);
  }
  rmSync(outDir, { recursive: true });

  console.log(formatBytes(minifiedSize), formatBytes(gzippedSize));
};

export default checkSizeOfPackage;
