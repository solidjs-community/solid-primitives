import type { Accessor, Resource } from "solid-js";

export type ItemType = "dir" | "file" | undefined;

export type SyncFileSystemAdapter = {
  async: false;
  getType: (path: string) => ItemType;
  mkdir: (path: string) => void;
  readdir: (path: string) => [] | [string, ...string[]];
  readFile: (path: string) => string;
  rename?: (previous: string, next: string) => void;
  rm: (path: string) => void;
  writeFile: (path: string, data: string) => void;
};

export type AsyncFileSystemAdapter = {
  async: true;
  getType: (path: string) => Promise<ItemType>;
  mkdir: (path: string) => Promise<void>;
  readdir: (path: string) => Promise<[] | [string, ...string[]]>;
  readFile: (path: string) => Promise<string>;
  rename?: (previous: string, next: string) => Promise<void>;
  rm: (path: string) => Promise<void>;
  writeFile: (path: string, data: string) => Promise<void>;
};

export type FileSystemAdapter = SyncFileSystemAdapter | AsyncFileSystemAdapter;

export type SyncFileSystem = {
  getType: (path: string) => Accessor<ItemType>;
  mkdir: (path: string) => void;
  readdir: (path: string) => Accessor<[] | [string, ...string[]]>;
  readFile: (path: string) => Accessor<string>;
  rename: (previous: string, next: string) => void;
  rm: (path: string) => void;
  writeFile: (path: string, data: string) => void;
};
export type AsyncFileSystem = {
  getType: (path: string) => Resource<ItemType>;
  mkdir: (path: string) => Promise<void>;
  readdir: (path: string) => Resource<[] | [string, ...string[]]>;
  readFile: (path: string) => Resource<string>;
  rename: (previous: string, next: string) => Promise<void>;
  rm: (path: string) => Promise<void>;
  writeFile: (path: string, data: string) => Promise<void>;
};

