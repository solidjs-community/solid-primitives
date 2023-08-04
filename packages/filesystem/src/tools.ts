import { createEffect, createRoot } from "solid-js";
import type { AsyncFileSystem, SyncFileSystem, FileSystemAdapter, DirEntries } from "./types";

export const getParentDir = (path: string) => path.split("/").slice(0, -1).join("/") || "/";

export const getItemName = (path: string) => path.split("/").at(-1);

export const limitPath =
  (basePath: string) =>
  (path: string): string => {
    const parts = (basePath + "/" + path).split("/").filter(part => !!part);
    let nextDots: number;
    while ((nextDots = parts.indexOf("..")) > -1) {
      if (nextDots === 0) {
        throw new Error(`cannot go below root path: ${path}`);
      }
      parts.splice(nextDots - 1, 2);
    }
    const result = (basePath.startsWith("/") ? "/" : "") + parts.join("/");
    if (!result.startsWith(basePath)) {
      throw new Error(`cannot go below base path: ${path}`);
    }
    return result;
  };

export const toPromise = <T>(command: () => T | undefined): Promise<T> =>
  new Promise<T>(resolve =>
    createRoot(dispose =>
      createEffect(() => {
        const result = command();
        if (result !== undefined) {
          resolve(result);
          dispose();
        }
      }),
    ),
  );

export const rsync = async (
  fs1: SyncFileSystem | AsyncFileSystem | FileSystemAdapter,
  src: string,
  fs2: SyncFileSystem | AsyncFileSystem | FileSystemAdapter,
  dest: string,
): Promise<void> => {
  const srcType = "async" in fs1 ? await fs1.getType(src) : await toPromise(() => fs1.getType(src));
  if (srcType === null) {
    throw new Error(`${src} does not exist in src filesystem`);
  } else if (srcType === "dir") {
    const dirEntries: DirEntries | undefined =
      "async" in fs1 ? await fs1.readdir(src) : await toPromise(() => fs1.readdir(src));
    const destType =
      "async" in fs2 ? await fs2.getType(dest) : await toPromise(() => fs2.getType(dest));
    if (destType === "file") {
      throw new Error(`cannot overwrite file ${dest} with directory`);
    } else if (destType === null) {
      await fs2.mkdir(dest);
    }
    for (var i = 0, len = dirEntries.length; i < len; i++) {
      const entry = dirEntries[i];
      entry &&
        (await rsync(
          fs1,
          `${src}${src.endsWith("/") ? "" : "/"}${getItemName(entry)}`,
          fs2,
          `${dest}${dest.endsWith("/") ? "" : "/"}${getItemName(entry)}`,
        ));
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (srcType === "file") {
    const fileData =
      "async" in fs1 ? await fs1.readFile(src) : await toPromise(() => fs1.readFile(src));
    return fs2.writeFile(dest, fileData);
  }
};
