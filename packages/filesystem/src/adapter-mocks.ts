/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DirEntries, ItemType, SyncFileSystemAdapter } from "./types.js";

/** Mocks a synchronous file system adapter */
export const makeNoFileSystem = () => ({
  async: false as const,
  getType: (path: string): ItemType => null,
  mkdir: (path: string) => undefined,
  readdir: (path: string): DirEntries => [],
  readFile: (path: string) => "",
  rename: (prev: string, next: string) => undefined,
  rm: (path: string) => undefined,
  writeFile: (path: string, data: string) => undefined,
});

/** Mocks an asynchronous file system adapter */
export const makeNoAsyncFileSystem = () => ({
  async: true as const,
  getType: (path: string): Promise<ItemType> => Promise.resolve(null),
  mkdir: (path: string) => Promise.resolve(),
  readdir: (path: string): Promise<DirEntries> => Promise.resolve([]),
  readFile: (path: string) => Promise.resolve(""),
  rename: (prev: string, next: string) => Promise.resolve(),
  rm: (path: string) => Promise.resolve(),
  writeFile: (path: string, data: string) => Promise.resolve(),
});
