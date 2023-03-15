///<reference path="../node_modules/@types/wicg-file-system-access/index.d.ts" />
import { batch, createResource, createSignal } from "solid-js";
import type { Accessor, Resource, ResourceActions, Setter } from "solid-js";

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

type SignalMap<T> = Map<string, [Accessor<T>, Setter<T>]>;
type ResourceMap<T> = Map<string, [Resource<T>, ResourceActions<T>]>;

const getParentDir = (path: string) => path.split("/").slice(0, -1).join("/") || "/";

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
          items => [...items, path.split("/").at(-1)] as [string, ...string[]],
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
          items.filter(item => item === previous.split("/").at(-1)) as [] | [string, ...string[]],
      );
      readdirMap.get(getParentDir(next))?.[1](
        items => [...items, next.split("/").at(-1)] as [string, ...string[]],
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
          items.filter(item => item === path.split("/").at(-1)) as [] | [string, ...string[]],
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
        const name = path.split("/").at(-1);
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

export type ObjectFileSystem = { [id: string]: string | ObjectFileSystem };
export type ObjectFileSystemItem = ObjectFileSystem | string | undefined;

export const makeVirtualFileSystem = (
  initial?: ObjectFileSystem,
  storage?: Storage,
  key = "solid-primitive-filesystem",
): SyncFileSystemAdapter & { toMap: () => Map<string, string> } => {
  let storedValue;
  try {
    storedValue = JSON.parse(storage?.getItem(key) || "null");
  } catch (e) {}
  const fs = storedValue || initial;
  const save = () => storage?.setItem(key, JSON.stringify(fs));
  save();
  const walk = (
    path: string,
    handler: (
      ref: ObjectFileSystemItem,
      part: string,
      index: number,
      parts: string[],
    ) => ObjectFileSystemItem,
  ): ObjectFileSystemItem => {
    let ref: ObjectFileSystemItem = fs;
    path = path.startsWith("/") ? path.slice(1) : path;
    path.split("/").forEach((part, index, parts) => {
      ref = part ? handler(ref, part, index, parts) : ref;
    });
    return ref;
  };
  function getFiles(): [string, string][];
  function getFiles(filter: (path: string, content: string) => string): string[];
  function getFiles(
    filter: (path: string, content: string) => [string, string],
  ): [string, string][];
  function getFiles(filter: any = (path: string, content: string) => [path, content]): any {
    const files: ReturnType<typeof filter>[] = [];
    const walker = (ref: ObjectFileSystemItem = fs || {}, path = "/") => {
      typeof ref === "object" &&
        Object.keys(ref).forEach((item: string) =>
          typeof ref[item] === "string"
            ? files.push(filter(`${path}${item}`, ref[item] as string))
            : walker(ref[item], `${path}${item}/`),
        );
    };
    walker();
    return files;
  }
  const ofs = {
    async: false as const,
    getType: (path: string): ItemType => {
      if (path === "" || path === "/") {
        return "dir";
      }
      const item = walk(path, (ref, part) => (typeof ref === "object" ? ref[part] : undefined));
      return item === undefined ? undefined : typeof item === "string" ? "file" : "dir";
    },
    mkdir: (path: string): void => (
      walk(path, (ref, part, index, parts) => {
        if (typeof ref !== "object") {
          throw new Error(`"${parts.slice(0, index).join("/")}" is not a directory`);
        }
        if (ref[part] === undefined) {
          ref[part] = {};
        } else if (typeof ref[part] === "string") {
          throw new Error(`Cannot overwrite file ${parts.slice(0, index + 1).join("/")} with path`);
        }
        return ref[part];
      }),
      save()
    ),
    readdir: (path: string): [] | [string, ...string[]] => {
      const item = walk(path.replace(/^\/$/, ""), (ref, part, index, parts) => {
        if (typeof ref !== "object") {
          throw new Error(`"${parts.slice(0, index).join("/")}" is not a directory`);
        }
        return index === 0 && part === "" ? ref : (ref = ref[part]);
      });
      if (typeof item !== "object") {
        throw new Error(`"${path}" is not a directory`);
      }
      return Object.keys(item) as [] | [string, ...string[]];
    },
    rename: (previous: string, next: string): void => {
      let previousPathName: string;
      const data = walk(previous, (ref, part, index, parts) => {
        if (typeof ref !== "object") {
          throw new Error(`"${parts.slice(0, index).join("/")}" is not a directory`);
        }
        if (index + 1 >= parts.length) {
          if (ref[part] === undefined) {
            throw new Error(`${previous} does not exist and therefore cannot be renamed`);
          } else {
            previousPathName = part;
          }
        }
        return ref[part];
      }) as ObjectFileSystem | string;
      walk(next, (ref, part, index, parts) => {
        if (typeof ref !== "object") {
          throw new Error(`"${parts.slice(0, index).join("/")}" is not a directory`);
        }
        if (index + 1 >= parts.length) {
          Object.keys(ref).forEach(item => {
            if (item === previousPathName) {
              ref[part] = data;
              delete ref[item];
            } else {
              (ref as any)[item] = ref[item];
            }
          });
        }
        return ref[part];
      });
    },
    rm: (path: string): void =>
      void walk(path, (ref, part, index, parts) => {
        if (typeof ref !== "object") {
          throw new Error(`"${parts.slice(0, index).join("/")}" is not a directory`);
        }
        if (index + 1 === parts.length) {
          delete ref[part];
          save();
        } else {
          ref = ref[part];
        }
        return ref;
      }),
    readFile: (path: string): string =>
      walk(path, (ref, part, index, parts) => {
        if (typeof ref !== "object") {
          throw new Error(`"${parts.slice(0, index).join("/")}" is not a directory`);
        }
        ref = ref[part];
        if (index + 1 === parts.length && typeof ref !== "string") {
          throw new Error(`"${path}" is not a file`);
        }
        return ref;
      }) as string,
    writeFile: (path: string, data: string): void =>
      void walk(path, (ref, part, index, parts) => {
        if (typeof ref !== "object") {
          throw new Error(`"${parts.slice(0, index).join("/")}" is not a directory`);
        }
        if (index + 1 === parts.length) {
          if (typeof ref[part] === "object") {
            throw new Error(`"${path}" is a directory and cannot be overwritten with a file`);
          }
          ref[part] = data;
          save();
        } else {
          return (ref = ref[part]);
        }
      }),
    toMap: () => {
      const fsMap = {
        clear: () => ofs.rm("/"),
        delete: path => ofs.getType(path) === "file" && ofs.rm(path),
        entries: () => getFiles()[Symbol.iterator](),
        forEach: (handler: (value: string, key: string, map: Map<string, string>) => void) => {
          getFiles().forEach(([key, value]) => handler(value, key, fsMap));
        },
        get: path => {
          try {
            return ofs.readFile(path);
          } catch (e) {}
        },
        has: path => ofs.getType(path) === "file",
        keys: () => getFiles(path => path)[Symbol.iterator](),
        set: (path, data) => {
          const parent = getParentDir(path);
          ofs.getType(parent) !== "dir" && ofs.mkdir(parent);
          ofs.writeFile(path, data);
          return fsMap;
        },
        get size() {
          return getFiles().length;
        },
        values: () => getFiles((_, value) => value)[Symbol.iterator](),
        [Symbol.iterator]: () => fsMap.entries(),
        [Symbol.toStringTag]: "Map",
      } as Map<string, string>;
      return fsMap;
    },
  };
  return ofs;
};

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
            .catch(() => undefined),
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

export const makeWebAccessFileSystem = process.env.SSR
  ? () => Promise.resolve(makeNoAsyncFileSystem())
  : typeof globalThis.showDirectoryPicker === "function"
  ? async (options?: DirectoryPickerOptions | undefined): Promise<AsyncFileSystemAdapter> => {
      const handle = await globalThis.showDirectoryPicker(options);
      const walk = async (
        path: string,
        handler: (
          handle: FileSystemDirectoryHandle | FileSystemFileHandle,
          part: string,
          index: number,
          parts: string[],
        ) =>
          | Promise<void | FileSystemDirectoryHandle | FileSystemFileHandle | undefined>
          | undefined,
      ): Promise<FileSystemDirectoryHandle | FileSystemFileHandle | undefined> => {
        const parts = path.split("/").filter(part => part);
        let currentHandle: FileSystemDirectoryHandle | FileSystemFileHandle | undefined = handle;
        for (let index = 0; index < parts.length; index++) {
          const part = parts[index]!;
          currentHandle = (await handler(currentHandle, part, index, parts)) || undefined;
          if (!currentHandle) {
            return undefined;
          }
        }
        return currentHandle;
      };
      const getNext = (handle: FileSystemDirectoryHandle | FileSystemFileHandle, part: string) =>
        handle.kind === "directory"
          ? handle
              .getDirectoryHandle(part)
              .catch(() => handle.getFileHandle(part))
              .catch(() => undefined)
          : undefined;
      return {
        async: true,
        getType: async path =>
          walk(path, getNext)
            .then(handle => (handle?.kind === "directory" ? "dir" : handle?.kind))
            .catch(() => undefined),
        readdir: async path =>
          walk(path, getNext).then(async handle => {
            if (handle?.kind !== "directory") {
              return [];
            }
            const items: string[] = [];
            for await (const name of handle.keys()) {
              items.push(name);
            }
            return items as [] | [string, ...string[]];
          }),
        mkdir: async path => {
          await walk(path, (handle, part, index, parts) =>
            handle.kind === "file"
              ? Promise.reject(
                  new Error(
                    `attempt to create directory "${path}" failed - "${parts
                      .slice(0, index)
                      .join("/")} is a file`,
                  ),
                )
              : handle.getDirectoryHandle(part, { create: true }),
          );
        },
        readFile: async path =>
          await walk(path, (handle, part, index, parts) =>
            index < parts.length - 1
              ? getNext(handle, part)
              : handle.kind === "directory"
              ? handle.getFileHandle(part)
              : undefined,
          ).then(handle =>
            handle?.kind === "file"
              ? handle.getFile().then(file => file.text())
              : Promise.reject(`reading file "${path}" failed - not a file`),
          ),
        writeFile: async (path, data) =>
          void (await walk(path, (handle, part, index, parts) =>
            index < parts.length - 1
              ? getNext(handle, part)
              : handle.kind === "directory"
              ? handle.getFileHandle(part, { create: true }).then(fileHandle =>
                  fileHandle
                    .createWritable()
                    .then(writable => writable.write(data).then(() => writable.close()))
                    .then(() => fileHandle),
                )
              : Promise.reject(
                  new Error(`could not write file ${path}, since path is no parent directory`),
                ),
          )),
        rm: async path =>
          void (await walk(path, (handle, part, index, parts) =>
            index < parts.length - 1
              ? getNext(handle, part)
              : handle.kind === "directory"
              ? handle.removeEntry(part, { recursive: true })
              : Promise.reject(new Error(`${path} not found; could not be removed`)),
          )),
      };
    }
  : () => Promise.resolve(makeNoAsyncFileSystem());

import type { FileEntry, FsDirOptions } from "@tauri-apps/api/fs";

const taurifs = (globalThis as any).__TAURI__?.fs;

export const makeTauriFileSystem = taurifs
  ? (options: FsDirOptions = { dir: taurifs.BaseDirectory.AppData }): AsyncFileSystemAdapter => ({
      async: true,
      getType: (path: string) =>
        taurifs.exists(path, options).then((present: boolean) =>
          present
            ? taurifs
                .readdir(path)
                .then(() => "dir" as const)
                .catch(() => "file" as const)
            : undefined,
        ),
      mkdir: (path: string) => taurifs.createDir(path, { ...options, recursive: true }),
      readdir: (path: string) =>
        taurifs.readdir(path, options).then((entries: FileEntry[]) =>
          entries.reduce((list, entry) => {
            entry.name && list.push(entry.name);
            return list;
          }, [] as string[]),
        ),
      readFile: (path: string) => taurifs.readTextFile(path, options),
      rename: (previous: string, next: string) => taurifs.renameFile(previous, next),
      rm: (path: string) =>
        taurifs
          .readdir(path)
          .then(() => taurifs.removeDir(path, { ...options, recursive: true }))
          .catch(() => taurifs.removeFile(path, options)),
      writeFile: (path: string, data: string) => taurifs.writeTextFile(path, data),
    })
  : makeNoAsyncFileSystem;
