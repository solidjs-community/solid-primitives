import { batch, createResource, createSignal } from "solid-js";
import type { Accessor, Resource, ResourceActions, Setter } from "solid-js";

import type { 
  ItemType,
  SyncFileSystem,
  AsyncFileSystem,
  FileSystemAdapter,
  SyncFileSystemAdapter,
  AsyncFileSystemAdapter,
} from "./types";

import { getItemName, getParentDir } from "./tools";

type SignalMap<T> = Map<string, [Accessor<T>, Setter<T>]>;
type ResourceMap<T> = Map<string, [Resource<T>, ResourceActions<T>]>;

/** makes a synchronous filesystem reactive */
export const createSyncFileSystem = (adapter: SyncFileSystemAdapter): SyncFileSystem => {
  const getTypeMap: SignalMap<ItemType> = new Map();
  const readdirMap: SignalMap<[] | [string, ...string[]]> = new Map();
  const readFileMap: SignalMap<string> = new Map();
  const fs: SyncFileSystem = {
    getType: path => {
      if (!getTypeMap.has(path)) {
        getTypeMap.set(path, createSignal());
      }
      const [fileType, setFileType] = getTypeMap.get(path)!;
      setFileType(adapter.getType(path));
      return fileType;
    },
    readdir: path => {
      if (!readdirMap.has(path)) {
        readdirMap.set(path, createSignal([]));
      }
      const [files, setFiles] = readdirMap.get(path)!;
      setFiles(adapter.readdir(path));
      return files;
    },
    mkdir: path => {
      adapter.mkdir(path);
      readdirMap.get(getParentDir(path))?.[1](items => [...items, path] as [string, ...string[]]);
      fs.readdir(path)();
    },
    readFile: path => {
      if (!readFileMap.has(path)) {
        readFileMap.set(path, createSignal(""));
      }
      const [data, setData] = readFileMap.get(path)!;
      setData(adapter.readFile(path));
      return data;
    },
    writeFile: (path, data) => {
      const newFile = adapter.getType(path) === undefined;
      adapter.writeFile(path, data);
      readFileMap.get(path)?.[1](data);
      if (newFile) {
        fs.getType(path)();
        readdirMap.get(getParentDir(path))?.[1](
          items => [...items, getItemName(path)] as [string, ...string[]],
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
          if (nextType === undefined) {
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
        items =>
          items.filter(item => item === getItemName(previous)) as [] | [string, ...string[]],
      );
      readdirMap.get(getParentDir(next))?.[1](
        items => [...items, getItemName(next)] as [string, ...string[]],
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
      readdirMap.get(getParentDir(path))?.[1](
        items =>
          items.filter(item => item === getItemName(path)) as [] | [string, ...string[]],
      );
    },
  };
  return fs;
};

/** makes an asynchronous filesystem reactive */
export const createAsyncFileSystem = (adapter: AsyncFileSystemAdapter): AsyncFileSystem => {
  const getTypeMap: ResourceMap<ItemType> = new Map();
  const readdirMap: ResourceMap<[] | [string, ...string[]]> = new Map();
  const readFileMap: ResourceMap<string> = new Map();
  const fs: AsyncFileSystem = {
    getType: path => {
      if (!getTypeMap.has(path)) {
        getTypeMap.set(
          path,
          createResource(() => adapter.getType(path)),
        );
      } else {
        getTypeMap.get(path)![1].refetch();
      }
      const [fileType] = getTypeMap.get(path)!;
      return fileType;
    },
    readdir: path => {
      if (!readdirMap.has(path)) {
        readdirMap.set(
          path,
          createResource<[] | [string, ...string[]]>(() => adapter.readdir(path), {
            initialValue: [],
          }),
        );
      } else {
        readdirMap.get(path)![1].refetch();
      }
      const [files] = readdirMap.get(path)!;
      return files;
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
    readFile: path => {
      if (!readFileMap.has(path)) {
        readFileMap.set(
          path,
          createResource(() => adapter.readFile(path), { initialValue: "" }),
        );
      } else {
        readFileMap.get(path)![1].refetch();
      }
      const [data] = readFileMap.get(path)!;
      return data;
    },
    writeFile: (path, data) =>
      adapter.writeFile(path, data).then(() => {
        readFileMap.get(path)?.[1].mutate(data);
        const name = getItemName(path);
        readdirMap
          .get(getParentDir(path))?.[1]
          .mutate(items =>
            items.includes(name) ? items : ([...items, name] as [string, ...string[]]),
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
          if (nextType === undefined) {
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
  return fs;
};

export function createFileSystem(fs: SyncFileSystemAdapter): SyncFileSystem;
export function createFileSystem(fs: AsyncFileSystemAdapter): AsyncFileSystem;
export function createFileSystem(fs: Promise<AsyncFileSystemAdapter>): Promise<AsyncFileSystem>;
export function createFileSystem(
  fs: FileSystemAdapter | Promise<AsyncFileSystemAdapter>,
): SyncFileSystem | AsyncFileSystem | Promise<AsyncFileSystem> {
  return fs instanceof Promise
    ? fs.then(fs => createAsyncFileSystem(fs))
    : fs.async
    ? createAsyncFileSystem(fs)
    : createSyncFileSystem(fs);
}
