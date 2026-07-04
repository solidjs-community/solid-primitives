import { batch, createResource, createSignal } from "solid-js";
import type { Accessor, Resource, ResourceActions, Setter } from "solid-js";

import type {
  ItemType,
  SyncFileSystem,
  AsyncFileSystem,
  SyncFileSystemAdapter,
  AsyncFileSystemAdapter,
  DirEntries,
  Watcher,
} from "./types.js";

import { getItemName, getParentDir } from "./tools.js";

type SignalMap<T> = Map<string, [Accessor<T>, Setter<T>]>;
type ResourceMap<T> = Map<string, [Resource<T>, ResourceActions<T>]>;

/** makes a synchronous filesystem reactive */
export const createSyncFileSystem = (
  adapter: SyncFileSystemAdapter,
  watcher?: Watcher,
): SyncFileSystem => {
  const getTypeMap: SignalMap<ItemType | undefined> = new Map();
  const readdirMap: SignalMap<DirEntries | undefined> = new Map();
  const readFileMap: SignalMap<string | undefined> = new Map();
  const fs: SyncFileSystem = {
    getType: (path, refresh) => {
      if (!getTypeMap.has(path)) {
        getTypeMap.set(path, createSignal());
      }
      const [fileType, setFileType] = getTypeMap.get(path)!;
      if (refresh || fileType() === undefined) {
        setFileType(adapter.getType(path));
      }
      return fileType();
    },
    readdir: (path, refresh) => {
      if (!readdirMap.has(path)) {
        readdirMap.set(path, createSignal());
      }
      const [files, setFiles] = readdirMap.get(path)!;
      if (refresh || files() === undefined) {
        setFiles(adapter.readdir(path));
      }
      return files();
    },
    mkdir: path => {
      adapter.mkdir(path);
      readdirMap.get(getParentDir(path))?.[1]((items = []) => [...items, path] as DirEntries);
    },
    readFile: (path, refresh) => {
      if (!readFileMap.has(path)) {
        readFileMap.set(path, createSignal());
      }
      const [data, setData] = readFileMap.get(path)!;
      if (refresh || data() === undefined) {
        setData(adapter.readFile(path));
      }
      return data();
    },
    writeFile: (path, data) => {
      const newFile = adapter.getType(path) === null;
      adapter.writeFile(path, data);
      readFileMap.get(path)?.[1](data);
      if (newFile) {
        fs.getType(path, true);
        readdirMap.get(getParentDir(path))?.[1](
          (items = []) => [...items, getItemName(path)] as DirEntries,
        );
      }
    },
    rename: (previous, next) => {
      const previousType = adapter.getType(previous);
      const nextType = adapter.getType(next);
      if (previousType === "dir" && nextType === "file") {
        throw new Error(`Cannot overwrite file "${next}" with directory "${previous}"`);
      }
      if (previousType === "file" && nextType === "dir") {
        throw new Error(`cannot overwrite directory "${next}" with file "${previous}"`);
      }
      if (typeof adapter.rename === "function") {
        adapter.rename(previous, next);
      } else {
        if (previousType === "dir") {
          if (nextType === null) {
            adapter.mkdir(next);
          }
          adapter
            .readdir(previous)
            .forEach(item => fs.rename(`${previous}/${item}`, `${next}/${item}`));
        } else {
          adapter.writeFile(next, adapter.readFile(previous));
        }
      }
      getTypeMap.get(previous)?.[1](undefined);
      getTypeMap.delete(previous);
      readdirMap.get(getParentDir(previous))?.[1](
        (items = []) => items.filter(item => item === getItemName(previous)) as [] | DirEntries,
      );
      readdirMap.get(getParentDir(next))?.[1](
        (items = []) => [...items, getItemName(next)] as DirEntries,
      );
    },
    rm: path => {
      adapter.rm(path);
      getTypeMap.get(path)?.[1](undefined);
      getTypeMap.delete(path);
      [...readdirMap.keys()].forEach(item => {
        if (item.startsWith(`${path}/`)) {
          getTypeMap.get(item)?.[1](undefined);
          getTypeMap.delete(item);
        }
      });
      if (readFileMap.has(path)) {
        readFileMap.get(path)?.[1](undefined);
        readFileMap.delete(path);
      }
      readdirMap.get(getParentDir(path))?.[1](
        (items = []) => items.filter(item => item === getItemName(path)) as [] | DirEntries,
      );
    },
  };
  if (watcher) {
    watcher((operation, path) => {
      if (operation === "mkdir" || operation === "rm") {
        readdirMap.get(getParentDir(path))?.[1]((items = []) =>
          items.includes(path as never) ? items : [...items, path],
        );
      }
      if (operation === "rm") {
        getTypeMap.get(path)?.[1](null);
      }
      if (operation === "writeFile" && readFileMap.has(path)) {
        fs.readFile(path, true);
      }
    });
  }
  return fs;
};

/** makes an asynchronous filesystem reactive */
export const createAsyncFileSystem = (
  adapter: AsyncFileSystemAdapter,
  watcher?: Watcher,
): AsyncFileSystem => {
  const getTypeMap: ResourceMap<ItemType | undefined> = new Map();
  const readdirMap: ResourceMap<DirEntries | undefined> = new Map();
  const readFileMap: ResourceMap<string | undefined> = new Map();
  const fs: AsyncFileSystem = {
    getType: (path, refresh) => {
      if (!getTypeMap.has(path)) {
        getTypeMap.set(
          path,
          createResource(() => adapter.getType(path)),
        );
      }
      const [fileType, { refetch }] = getTypeMap.get(path)!;
      if (refresh) {
        refetch();
      }
      return fileType();
    },
    readdir: (path, refresh) => {
      if (!readdirMap.has(path)) {
        readdirMap.set(
          path,
          createResource<DirEntries | undefined>(() => adapter.readdir(path)),
        );
      }
      const [files, { refetch }] = readdirMap.get(path)!;
      if (refresh) {
        refetch();
      }
      return files();
    },
    mkdir: path =>
      adapter.mkdir(path).then(() => {
        path.split("/").forEach((_, index, parts) => {
          const subPath = parts.slice(0, index + 1).join("/");
          if (!getTypeMap.has(subPath)) {
            fs.getType(subPath);
          } else {
            getTypeMap.get(subPath)![1].refetch();
          }
        });
        readdirMap.get(getParentDir(path))?.[1].refetch();
      }),
    readFile: (path, refresh) => {
      if (!readFileMap.has(path)) {
        readFileMap.set(
          path,
          createResource(() => adapter.readFile(path)),
        );
      }
      const [data, { refetch }] = readFileMap.get(path)!;
      if (refresh) {
        refetch();
      }
      return data();
    },
    writeFile: (path, data) =>
      adapter.writeFile(path, data).then(() => {
        readFileMap.get(path)?.[1].mutate(data);
        const name = getItemName(path);
        readdirMap
          .get(getParentDir(path))?.[1]
          .mutate((items = []) =>
            items.includes(name as never) ? items : ([...items, name] as DirEntries),
          );
      }),
    rename: async (previous, next) => {
      const previousType = await adapter.getType(previous);
      const nextType = await adapter.getType(next);
      if (previousType === "dir" && nextType === "file") {
        throw new Error(`Cannot overwrite file "${next}" with directory "${previous}"`);
      }
      if (previousType === "file" && nextType === "dir") {
        throw new Error(`cannot overwrite directory "${next}" with file "${previous}"`);
      }
      if (typeof adapter.rename === "function") {
        await adapter.rename(previous, next);
      } else {
        if (previousType === "dir") {
          if (nextType === null) {
            await adapter.mkdir(next);
          }
          (await adapter.readdir(previous)).forEach(item =>
            fs.rename(`${previous}/${item}`, `${next}/${item}`),
          );
        } else {
          await adapter.writeFile(next, await adapter.readFile(previous));
        }
        await adapter.rm(previous);
      }
      batch(() => {
        getTypeMap.get(previous)?.[1].mutate(undefined);
        getTypeMap.delete(previous);
        const previousParent = getParentDir(previous);
        readdirMap.get(previousParent)?.[1].refetch();
        const nextParent = getParentDir(next);
        if (previousParent !== nextParent) readdirMap.get(nextParent)?.[1].refetch();
      });
    },
    rm: path =>
      adapter.rm(path).then(() => {
        getTypeMap.get(path)?.[1].mutate(undefined);
        getTypeMap.delete(path);
        [...readdirMap.keys()].forEach(item => {
          if (item.startsWith(`${path}/`)) {
            getTypeMap.get(item)?.[1].mutate(undefined);
            getTypeMap.delete(item);
          }
        });
        readdirMap.get(getParentDir(path))?.[1].refetch();
      }),
  };
  if (watcher) {
    watcher((operation, path) => {
      if (operation === "mkdir" || operation === "rm") {
        readdirMap
          .get(getParentDir(path))?.[1]
          .mutate((items = []) => (items.includes(path as never) ? items : [...items, path]));
      }
      if (operation === "rm") {
        getTypeMap.get(path)?.[1].mutate(null);
      }
      if (operation === "writeFile") {
        readFileMap.get(path)?.[1].refetch();
      }
    });
  }
  return fs;
};

export function createFileSystem(fs: SyncFileSystemAdapter, watcher?: Watcher): SyncFileSystem;
export function createFileSystem(fs: AsyncFileSystemAdapter, watcher?: Watcher): AsyncFileSystem;
export function createFileSystem(
  fs: Promise<AsyncFileSystemAdapter>,
  watcher?: Watcher,
): Promise<AsyncFileSystem>;
export function createFileSystem(
  fs: SyncFileSystemAdapter | AsyncFileSystemAdapter | Promise<AsyncFileSystemAdapter> | null,
  watcher?: Watcher,
): SyncFileSystem | AsyncFileSystem | Promise<AsyncFileSystem> {
  if (fs === null) {
    throw new Error("file system adapter is null");
  }
  return fs instanceof Promise
    ? fs.then(fs => createAsyncFileSystem(fs, watcher))
    : fs.async
      ? createAsyncFileSystem(fs, watcher)
      : createSyncFileSystem(fs, watcher);
}
