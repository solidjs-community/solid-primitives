import { SyncFileSystemAdapter, AsyncFileSystemAdapter } from "./types";

export const makeNoFileSystem = (): SyncFileSystemAdapter => ({
  async: false,
  getType: () => undefined,
  mkdir: () => undefined,
  readdir: () => [],
  readFile: () => "",
  rename: () => undefined,
  rm: () => undefined,
  writeFile: () => undefined,
});

export const makeNoAsyncFileSystem = (): AsyncFileSystemAdapter => ({
  async: true,
  getType: () => Promise.resolve(undefined),
  mkdir: () => Promise.resolve(),
  readdir: () => Promise.resolve([]),
  readFile: () => Promise.resolve(""),
  rename: () => Promise.resolve(),
  rm: () => Promise.resolve(),
  writeFile: () => Promise.resolve(),
});
