import { makeNoAsyncFileSystem } from "./adapter-mocks";
import { limitPath } from "./tools";
import type { AsyncFileSystemAdapter } from "./types";

export const makeNodeFileSystem = process.env.SSR
  ? async (basePath: string = "/"): Promise<AsyncFileSystemAdapter> => {
      const fs = await import("fs/promises");
      const p = limitPath(basePath);
      return {
        async: true,
        getType: (path: string) =>
          fs
            .stat(p(path))
            .then((stat: { isDirectory: () => boolean }) => (stat.isDirectory() ? "dir" : "file"))
            .catch(() => null),
        mkdir: (path: string) => fs.mkdir(p(path), { recursive: true }).then(() => undefined),
        readdir: (path: string) => fs.readdir(p(path)) as Promise<[] | [string, ...string[]]>,
        readFile: (path: string) => fs.readFile(p(path), { encoding: "utf8" }),
        rename: (previous: string, next: string) => fs.rename(p(previous), p(next)),
        rm: (path: string) => fs.rm(p(path), { recursive: true }),
        writeFile: (path: string, data: string) =>
          fs.writeFile(p(path), data, { encoding: "utf8" }),
      };
    }
  : makeNoAsyncFileSystem;
