///<reference path="../node_modules/@types/wicg-file-system-access/index.d.ts" />
import { createEffect, createResource, createSignal, getOwner, on, runWithOwner } from "solid-js";
import type { Accessor, Owner, Resource, ResourceActions, Setter } from "solid-js";

export type FSItem = {
  delete: () => void;
  readonly length: number;
  uri: string;
  rename: (name: string) => void;
  type: "dir" | "file";
};
export type FSDir<Items extends string[] = string[]> = FSItem & {
  [name in Items[number]]: FSDir<Items> | FSFile;
} & {
  readonly items: Items;
  mkdir: (uri: string) => void | Promise<void>;
  mkfile: (uri: string, data?: string) => void | Promise<void>;
  type: "dir";
};
export type FSFile = FSItem & {
  // accessor for synchronous fs, resource for async fs
  data: () => string | undefined;
  setData: (data: string) => void;
  type: "file";
};

export type FileSystem = FSDir;

export type FSSignals = Map<string, [Accessor<void>, Setter<void>]>;

const applyItem = (dir: FSDir, getNode: (uri: string) => FSDir | FSFile) => (item: string) => {
  Object.defineProperty(dir, item, {
    configurable: true,
    enumerable: true,
    get: () => getNode(`${dir.uri}/${item}`),
    set: () => {
      throw new Error("attempting to write fs tree");
    },
  });
};

const createNode = (
  uri: string,
  fs: FileSystemAdapter,
  signals: FSSignals,
  owner?: Owner | null,
): FSDir | FSFile => {
  uri = uri.startsWith("/") ? uri.slice(1) : uri;
  const path: string[] = uri.split("/");
  if (fs.async) {
    throw new Error("TODO: async file system not yet supported");
  } else {
    const type = fs.getType(uri);
    if (type === undefined) {
      throw new Error(`cannot read filesystem entry (uri "${uri}" yields undefined)`);
    }
    if (!signals.has(uri)) {
      signals.set(uri, createSignal<void>(undefined, { equals: false }));
    }
    const [change, changed] = signals.get(uri) as [Accessor<void>, Setter<void>];
    if (type === "file") {
      let initial = true;
      let data: string | undefined;
      const file: FSFile = {
        uri,
        type: "file" as const,
        data: () => {
          change();
          if (initial) {
            initial = false;
            data = fs.readFile(uri);
          }
          return data;
        },
        delete: () => {
          data = undefined;
          fs.rm(uri);
          setTimeout(() => {
            signals.delete(uri);
            signals.get(uri.split("/").slice(0, -1).join("/"))?.[1]();
          }, 0);
        },
        get length() {
          return file.data()?.length || 0;
        },
        rename: name => {
          const dest = name.indexOf("/") === -1 ? `${path.slice(0, -1).join("/")}/${name}` : name;
          if (uri === dest) {
            return;
          }
          if (typeof fs.rename === "function") {
            fs.rename(uri, dest);
          } else {
            fs.writeFile(dest, file.data() || "");
            fs.rm(uri);
          }
          changed();
          setTimeout(() => {
            signals.delete(uri);
            signals.set(dest, createSignal<void>(undefined, { equals: false }));
            signals.get(dest.split("/").slice(0, -1).join("/"))?.[1]();
          }, 0);
        },
        setData(update) {
          data = update;
          fs.writeFile(uri, update);
          changed();
        },
      };
      return file;
    }
    const [items, setItems] = createSignal<string[]>(fs.readdir(uri));
    const dir = {
      uri,
      get items() {
        return items();
      },
      type: "dir" as const,
      get length() {
        return items().length;
      },
      rename: (name: string) => {
        const dest = (
          name.indexOf("/") === -1 ? `${path.slice(0, -1).join("/")}/${name}` : name
        ).replace(/^\//, "");
        if (typeof fs.rename === "function") {
          fs.rename(uri, dest);
        } else {
          fs.mkdir(dest);
          for (let i = 0; i < items.length; i++) {
            fs.writeFile(`${dest}/${items()[i]}`, fs.readFile(`${uri}/${items()[i]}`));
          }
          fs.rm(uri);
        }
        dir.uri = dest;
        changed();
        signals.get(dest.split("/").slice(0, -1).join("/"))?.[1]();
      },
      delete: () => {
        fs.rm(uri);
        changed();
        signals.get(uri.split("/").slice(0, -1).join("/"))?.[1]();
      },
      mkdir: (name: string) => {
        const dest = uri !== "/" ? `${uri}/${name}` : name;
        fs.mkdir(dest);
        signals.set(dest, createSignal<void>(undefined, { equals: false }));
        applyItem(dir, uri => createNode(uri, fs, signals, owner))(dest);
        setTimeout(changed, 10);
      },
      mkfile: (name: string, data: string | undefined) => {
        const dest = uri !== "/" ? `${uri}/${name}` : name;
        fs.writeFile(dest, data || "");
        signals.set(dest, createSignal<void>(undefined, { equals: false }));
        applyItem(dir, uri => createNode(uri, fs, signals, owner))(dest);
        setTimeout(changed, 10);
      },
    } as FSDir;
    const effect = on(change, () => setItems(fs.readdir(uri)), { defer: true });
    owner
      ? runWithOwner(owner, () => {
          createEffect(effect);
          items().forEach(applyItem(dir, uri => createNode(uri, fs, signals, owner)));
        })
      : () => {
          createEffect(effect);
          items().forEach(applyItem(dir, uri => createNode(uri, fs, signals, owner)));
        };
    return dir;
  }
};

export const createFileSystemStore = (adapter: FileSystemAdapter): FileSystem => {
  const signals: FSSignals = new Map();
  return createNode("", adapter, signals, getOwner()) as FileSystem;
};

export type FileType = "dir" | "file" | undefined;

export type SyncFileSystemAdapter = {
  async: false;
  getType: (path: string) => FileType;
  mkdir: (path: string) => void;
  readdir: (path: string) => [] | [string, ...string[]];
  readFile: (path: string) => string;
  rename?: (previous: string, next: string) => void;
  rm: (path: string) => void;
  writeFile: (path: string, data: string) => void;
};

export type AsyncFileSystemAdapter = {
  async: true;
  getType: (path: string) => Promise<FileType>;
  mkdir: (path: string) => Promise<void>;
  readdir: (path: string) => Promise<[] | [string, ...string[]]>;
  readFile: (path: string) => Promise<string>;
  rename?: (previous: string, next: string) => Promise<void>;
  rm: (path: string) => Promise<void>;
  writeFile: (path: string, data: string) => Promise<void>;
};

export type FileSystemAdapter = SyncFileSystemAdapter | AsyncFileSystemAdapter;

export type SyncFileSystem = {
  getType: (path: string) => Accessor<FileType>;
  mkdir: (path: string) => void;
  readdir: (path: string) => Accessor<[] | [string, ...string[]]>;
  readFile: (path: string) => Accessor<string>;
  rename: (previous: string, next: string) => void;
  rm: (path: string) => void;
  writeFile: (path: string, data: string) => void;
};
export type AsyncFileSystem = {
  getType: (path: string) => Resource<FileType>;
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
  const getTypeMap: SignalMap<FileType> = new Map();
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
      console.log(getParentDir(path));
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
  const getTypeMap: ResourceMap<FileType> = new Map();
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
        readFileMap.get(path)?.[1].mutate(data)
        const name = path.split("/").at(-1);
        readdirMap.get(getParentDir(path))?.[1].mutate(
          (items) => items.includes(name) ? items : [...items, name] as [string, ...string[]]
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
      }
      getTypeMap.get(previous)?.[1].mutate(undefined);
      getTypeMap.delete(previous);
      readdirMap.get(getParentDir(previous))?.[1].refetch();
      readdirMap.get(getParentDir(next))?.[1].refetch();
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

export type ObjectFileSystem = { [id: string]: string | ObjectFileSystem };
type ObjectFileSystemItem = ObjectFileSystem | string | undefined;

export const makeObjectFileSystem = (
  initial?: ObjectFileSystem,
  storage?: Storage,
  key = "solid-primitive-filesystem",
): SyncFileSystemAdapter => {
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
  return {
    async: false,
    getType: (path: string): FileType => {
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
  };
};

export function createFileSystem(fs: SyncFileSystemAdapter): SyncFileSystem;
export function createFileSystem(fs: AsyncFileSystemAdapter): AsyncFileSystem;
export function createFileSystem(fs: Promise<AsyncFileSystemAdapter>): Promise<AsyncFileSystem>;
export function createFileSystem(fs: FileSystemAdapter | Promise<AsyncFileSystemAdapter>): 
SyncFileSystem | AsyncFileSystem | Promise<AsyncFileSystem> {
  return fs instanceof Promise
    ? fs.then(fs => createAsyncFileSystem(fs))
    : fs.async
    ? createAsyncFileSystem(fs)
    : createSyncFileSystem(fs);
}

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


export const makeNodeFileSystem = process.env.SSR
  ? (): AsyncFileSystemAdapter => {
      const fs = require("fs/promises");
      return {
        async: true,
        getType: (path: string) =>
          fs
            .stat(path)
            .then((stat: { isDirectory: () => boolean }) => (stat.isDirectory() ? "dir" : "file"))
            .catch(() => undefined),
        mkdir: (path: string) => fs.mkdir(path, { recursive: true }),
        readdir: (path: string) => fs.readdir(path),
        readFile: (path: string) => fs.readFile(path, { encoding: "utf8" }),
        rename: (previous: string, next: string) => fs.rename(previous, next),
        rm: (path: string) => fs.rm(path, { recursive: true }),
        writeFile: (path: string, data: string) => fs.writeFile(path, { encoding: "utf8" }, data),
      };
    }
  : makeNoFileSystem;

// TODO: use WebAPIs for Filesystem access

export const makeWebAccessFileSystem =
  typeof globalThis.showDirectoryPicker === "function"
    ? async (options?: DirectoryPickerOptions | undefined): Promise<AsyncFileSystemAdapter> => {
        const handle = await globalThis.showDirectoryPicker(options);
        const walk = async (
          path: string,
          handler: (
            handle: FileSystemDirectoryHandle | FileSystemFileHandle,
            part: string,
            index: number,
            parts: string[],
          ) => Promise<void | FileSystemDirectoryHandle | FileSystemFileHandle | undefined> | undefined,
        ): Promise<FileSystemDirectoryHandle | FileSystemFileHandle | undefined> => {
          const parts = path.split("/").filter(part => part);
          let currentHandle: FileSystemDirectoryHandle | FileSystemFileHandle | undefined = handle;
          for (let index = 0; index < parts.length; index++) {
            const part = parts[index]!;
            currentHandle = await handler(currentHandle, part, index, parts) || undefined;
            if (!currentHandle) {
              return undefined;
            }
          }
          return currentHandle;
        };
        const getNext = (handle: FileSystemDirectoryHandle | FileSystemFileHandle, part: string) =>
          handle.kind === "directory" ? handle.getDirectoryHandle(part).catch(e => undefined) : undefined;
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
          readFile: async path => await walk(path, (handle, part, index, parts) =>
            index < parts.length - 1
            ? getNext(handle, part)
            : handle.kind === "directory"
            ? handle.getFileHandle(part)
            : undefined
          ).then(
            handle => handle?.kind === "file"
              ? handle.getFile().then(file => file.text())
              : Promise.reject(`reading file "${path}" failed - not a file`)
          ),
          writeFile: async (path, data) => void await walk(path, (handle, part, index, parts) => 
            index < parts.length - 1
            ? getNext(handle, part)
            : handle.kind === "directory"
            ? handle.getFileHandle(part, { create: true }).then(
                fileHandle => fileHandle.createWritable()
                  .then(writable => writable.write(data).then(() => writable.close()))
                  .then(() => fileHandle)
              )
            : Promise.reject(new Error(`could not write file ${path}, since path is no parent directory`))
          ),
          rm: async path => void await walk(path, (handle, part, index, parts) => index < parts.length - 1
            ? getNext(handle, part)
            : handle.kind === "directory"
            ? handle.removeEntry(part, { recursive: true })
            : Promise.reject(new Error(`${path} not found; could not be removed`))
          ),
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
