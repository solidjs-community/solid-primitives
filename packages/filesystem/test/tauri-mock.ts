/* eslint-disable @typescript-eslint/no-unused-vars */
import { makeVirtualFileSystem } from "../src";
import { FileEntry, FsDirOptions } from "@tauri-apps/api/fs";

const vfs = makeVirtualFileSystem();

(globalThis as any).__TAURI__ = {
  fs: {
    exists: (path: string, options: FsDirOptions) => Promise.resolve(vfs.getType(path) !== null),
    createDir: (path: string, options: FsDirOptions) => (vfs.mkdir(path), Promise.resolve()),
    readdir: (path: string, options: FsDirOptions) =>
      vfs.getType(path) === "dir"
        ? Promise.resolve(vfs.readdir(path).map(name => ({ name }) as unknown as FileEntry))
        : Promise.reject(new Error("not a directory")),
    readTextFile: (path: string, options: FsDirOptions) => Promise.resolve(vfs.readFile(path)),
    renameFile: (prev: string, next: string) => Promise.resolve(vfs.rename(prev, next)),
    writeFile: (path: string, data: string) => Promise.resolve(vfs.writeFile(path, data)),
    removeDir: (path: string, options: FsDirOptions) =>
      vfs.getType(path) === "dir"
        ? Promise.resolve(vfs.rm(path))
        : Promise.reject(new Error("not a directory")),
    removeFile: (path: string, options: FsDirOptions) =>
      vfs.getType(path) === "file"
        ? Promise.resolve(vfs.rm(path))
        : Promise.reject(new Error("not a file")),
  },
};
