export type ItemType = "dir" | "file" | null;

export type DirEntries = [] | [string, ...string[]];

export type SyncFileSystemAdapter = {
  async: false;
  getType: (path: string) => ItemType;
  mkdir: (path: string) => void;
  readdir: (path: string) => DirEntries;
  readFile: (path: string) => string;
  rename?: (previous: string, next: string) => void;
  rm: (path: string) => void;
  writeFile: (path: string, data: string) => void;
};

export type AsyncFileSystemAdapter = {
  async: true;
  getType: (path: string) => Promise<ItemType>;
  mkdir: (path: string) => Promise<void>;
  readdir: (path: string) => Promise<DirEntries>;
  readFile: (path: string) => Promise<string>;
  rename?: (previous: string, next: string) => Promise<void>;
  rm: (path: string) => Promise<void>;
  writeFile: (path: string, data: string) => Promise<void>;
};

export type FileSystemAdapter = SyncFileSystemAdapter | AsyncFileSystemAdapter;

export type SyncFileSystem = {
  getType: (path: string, refresh?: true) => ItemType | undefined;
  mkdir: (path: string) => void;
  readdir: (path: string, refresh?: true) => DirEntries | undefined;
  readFile: (path: string, refresh?: true) => string | undefined;
  rename: (previous: string, next: string) => void;
  rm: (path: string) => void;
  writeFile: (path: string, data: string) => void;
};
export type AsyncFileSystem = {
  getType: (path: string, refresh?: true) => ItemType | undefined;
  mkdir: (path: string) => Promise<void>;
  readdir: (path: string, refresh?: true) => DirEntries | undefined;
  readFile: (path: string, refresh?: true) => string | undefined;
  rename: (previous: string, next: string) => Promise<void>;
  rm: (path: string) => Promise<void>;
  writeFile: (path: string, data: string) => Promise<void>;
};

export type Operation = "rm" | "writeFile" | "mkdir";
export type Watcher = (fn: (operation: Operation, path: string) => void) => void;
