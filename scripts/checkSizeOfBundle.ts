import { buildSync } from "esbuild";
import { readFileSync, writeFileSync, rmSync } from "fs";
import { gzipSizeSync } from "gzip-size";
import { r } from "./utils";

let recursive = false;
const checkSizeOfBundle = async ({
  type,
  packageName,
  exportName,
  excludeGzipHeadersAndMetadataSize,
  isExportDefault,
  peerDependencies,
}: {
  type: "package" | "export";
  packageName: string;
  exportName?: string;
  excludeGzipHeadersAndMetadataSize?: boolean;
  isExportDefault?: boolean;
  peerDependencies?: string[];
}): Promise<{
  minifiedSize: number;
  gzippedSize: number;
}> => {
  const exportValue = isExportDefault ? `{ default as ${exportName} }` : `{ ${exportName} }`;
  const file = `
export ${exportValue} from "./packages/${packageName}/src/index"
`;
  const fileName = "_temp_check_primitive_size.ts";
  const outDir = r("../_temp_output_primitive_size_dir");
  const outFile = `${outDir}/main.js`;
  const packagePath = r(`../packages/${packageName}/src/`);
  const packageIndexPath = `${packagePath}/index.ts`;
  const packageExportFilePath = r(`../${fileName}`);
  if (type === "export") {
    writeFileSync(packageExportFilePath, file);
  }

  buildSync({
    entryPoints: [type === "package" ? packageIndexPath : packageExportFilePath],
    outfile: outFile,
    target: ["esnext"],
    format: "esm",
    bundle: true,
    minify: true,
    treeShaking: true,
    platform: "browser",
    external: peerDependencies || ["solid-js", "node-fetch", "chokidar", "fs"],
  });

  const gzipHeadersAndMetadataSize = 20; // around 20 bytes
  const buffer = readFileSync(outFile);
  const minifiedSize = buffer.toString().length;

  const gzippedSize =
    gzipSizeSync(buffer) - (excludeGzipHeadersAndMetadataSize ? gzipHeadersAndMetadataSize : 0);
  if (type === "export") {
    rmSync(packageExportFilePath);
  }
  rmSync(outDir, { recursive: true });

  const result = {
    minifiedSize,
    gzippedSize,
  };

  if (minifiedSize <= 0) {
    if (recursive) {
      recursive = false;
      return result;
    }
    recursive = true;

    return await checkSizeOfBundle({
      packageName,
      type,
      excludeGzipHeadersAndMetadataSize,
      exportName,
      isExportDefault: !isExportDefault,
    });
  }

  return result;
};

export default checkSizeOfBundle;
