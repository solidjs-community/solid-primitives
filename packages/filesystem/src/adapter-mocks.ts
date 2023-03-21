import { SyncFileSystemAdapter, AsyncFileSystemAdapter } from "./types";

/** Mocks a synchronous file system adapter */
export const makeNoFileSystem = (): SyncFileSystemAdapter => ({
  async: false,
  getType: () => null,
  mkdir: () => undefined,
  readdir: () => [],
  readFile: () => "",
  rename: () => undefined,
  rm: () => undefined,
  writeFile: () => undefined,
});

/** Mocks an asynchronous file system adapter */
export const makeNoAsyncFileSystem = (): AsyncFileSystemAdapter => ({
  async: true,
  getType: () => Promise.resolve(null),
  mkdir: () => Promise.resolve(),
  readdir: () => Promise.resolve([]),
  readFile: () => Promise.resolve(""),
  rename: () => Promise.resolve(),
  rm: () => Promise.resolve(),
  writeFile: () => Promise.resolve(),
});
