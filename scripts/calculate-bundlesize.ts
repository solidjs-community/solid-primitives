import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { build } from "esbuild";
import { gzipSize } from "gzip-size";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GZIP_HEADERS_AND_METADATA_SIZE = 20; // around 20 bytes

export const getPackageBundlesize = async (
  packageName: string,
  {
    exportName,
    isExportDefault,
    peerDependencies,
  }: {
    exportName?: string;
    isExportDefault?: boolean;
    peerDependencies?: string[];
  } = {},
): Promise<{ min: number; gzip: number } | null> => {
  const randomHash = Math.random().toString(36).substring(2, 15);

  const tempDir = path.join(__dirname, "_temp_calculate-bundlesize");
  // create temp directory
  if (!fs.existsSync(tempDir)) {
    try {
      await fsp.mkdir(tempDir);
    } catch (e) {}
  }

  const tempFilename = `${exportName ? `${packageName}_${exportName}` : packageName}_${randomHash}`;
  const packagePath = path.join(__dirname, `../packages/${packageName}`);
  const outFilepath = path.join(tempDir, `${tempFilename}.js`);
  const exportFilepath = path.join(tempDir, `${tempFilename}.ts`);

  let indexFilepath = path.join(packagePath, `/src/index.ts`);
  if (!fs.existsSync(indexFilepath)) {
    indexFilepath = path.join(packagePath, `/src/index.tsx`);
  }

  if (exportName) {
    await fsp.writeFile(
      exportFilepath,
      `export ${
        isExportDefault ? `{ default as ${exportName} }` : `{ ${exportName} }`
      } from "../../packages/${packageName}/src"`,
    );
  }

  try {
    await build({
      logLevel: "silent",
      entryPoints: [exportName ? exportFilepath : indexFilepath],
      outfile: outFilepath,
      target: ["esnext"],
      format: "esm",
      bundle: true,
      minify: true,
      treeShaking: true,
      platform: "browser",
      conditions: ["production", "browser"],
      external: ["solid-js", "node-fetch", "chokidar", "fs", ...(peerDependencies ?? [])],
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(
      `Error when building ${exportName ? `${packageName}_${exportName}` : packageName}:\n`,
      e,
    );
    return null;
  }

  const buffer = await fsp.readFile(outFilepath);
  const minifiedSize = buffer.toString().length;

  const gzippedSize = (await gzipSize(buffer)) - GZIP_HEADERS_AND_METADATA_SIZE;

  fs.existsSync(exportFilepath) && (await fsp.rm(exportFilepath));
  fs.existsSync(outFilepath) && (await fsp.rm(outFilepath));

  // if (minifiedSize <= 0) {
  //   if (recursive) {
  //     recursive = false;
  //     return result;
  //   }
  //   recursive = true;

  //   return await getExportBundlesize({
  //     packageName,
  //     type,
  //     exportName,
  //     isExportDefault: !isExportDefault,
  //   });
  // }

  return {
    min: minifiedSize,
    gzip: gzippedSize,
  };
};

export type FormattedBytes = [value: number, unit: string];

export function formatBytes(
  bytes: string | number,
  {
    decimals = 2,
    k = 1000,
    sizes = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
  }: {
    decimals?: number;
    sizes?: string[];
    // Some manufacturers, such as Mac, considers kilobyte to be 1000 bytes while others define it as 1024 bytes https://ux.stackexchange.com/a/13850/140158
    k?: 1000 | 1024;
  } = {},
): FormattedBytes {
  if (!+bytes) {
    const unit = sizes[0]!;
    const number = 0;

    return [number, unit];
  }

  const dm = decimals < 0 ? 0 : decimals;

  const i = Math.floor(Math.log(bytes as number) / Math.log(k));
  const number = parseFloat(((bytes as number) / Math.pow(k, i)).toFixed(dm));
  const unit = sizes[i]!;

  return [number, unit];
}
