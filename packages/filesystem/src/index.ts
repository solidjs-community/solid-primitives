import {
  createEffect,
  createSignal,
  getOwner,
  on,
  runWithOwner,
  Setter,
} from "solid-js";
import { Accessor, Owner } from "solid-js";

export type FSItem = {
  delete: () => void;
  readonly length: number;
  uri: string;
  rename: (name: string) => void;
  type: "dir" | "file";
};
export type FSDir<Items extends string[] = string[]> = FSItem &
    { [name in Items[number]]: FSDir<Items> | FSFile } & {
    readonly items: Items,
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

export type SyncFileSystemAdapter = {
  async: false;
  getType: (path: string) => "dir" | "file" | undefined;
  mkdir: (path: string) => void;
  ls: (path: string) => [] | [string, ...string[]];
  read: (path: string) => string;
  rename?: (previous: string, next: string) => void;
  rm: (path: string) => void;
  write: (path: string, data: string) => void;
};

export type AsyncFileSystemAdapter = {
  async: true;
  getType: (path: string) => Promise<"dir" | "file" | undefined>;
  mkdir: (path: string) => Promise<void>;
  ls: (path: string) => Promise<string[]>;
  read: (path: string) => Promise<string>;
  rename?: (previous: string, next: string) => Promise<void>;
  rm: (path: string) => Promise<void>;
  write: (path: string, data: string) => Promise<void>;
};

export type FileSystemAdapter = SyncFileSystemAdapter | AsyncFileSystemAdapter;

const applyItem =
  (dir: FSDir, getNode: (uri: string) => FSDir | FSFile) => (item: string) => {
    Object.defineProperty(dir, item, {
      configurable: true,
      enumerable: true,
      get: () => getNode(`${dir.uri}/${item}`),
      set: () => console.warn("attempting to write fs tree"),
    });
  };

const createNode = (
  uri: string,
  fs: FileSystemAdapter,
  signals: FSSignals,
  owner?: Owner | null
): FSDir | FSFile => {
  uri = uri.startsWith("/") ? uri.slice(1) : uri;
  const path: string[] = uri.split("/");
  if (fs.async) {
    throw new Error("TODO: async file system not yet supported");
  } else {
    const type = fs.getType(uri);
    if (type === undefined) {
      throw new Error(
        `cannot read filesystem entry (uri "${uri}" yields undefined)`
      );
    }
    if (!signals.has(uri)) {
      signals.set(uri, createSignal<void>(undefined, { equals: false }));
    }
    const [change, changed] = signals.get(uri) as [
      Accessor<void>,
      Setter<void>
    ];
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
            data = fs.read(uri);
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
        rename: (name) => {
          const dest =
            name.indexOf("/") === -1
              ? `${path.slice(0, -1).join("/")}/${name}`
              : name;
          if (uri === dest) {
            return;
          }
          if (typeof fs.rename === "function") {
            fs.rename(uri, dest);
          } else {
            fs.write(dest, file.data() || "");
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
          fs.write(uri, update);
          changed();
        },
      };
      return file;
    }
    const [items, setItems] = createSignal<string[]>(fs.ls(uri));
    const dir = {
      uri,
      get items() { return items(); },
      type: "dir" as const,
      get length() { return items().length; },
      rename: (name: string) => {
        const dest = (
          name.indexOf("/") === -1
            ? `${path.slice(0, -1).join("/")}/${name}`
            : name
        ).replace(/^\//, "");
        if (typeof fs.rename === "function") {
          fs.rename(uri, dest);
        } else {
          fs.mkdir(dest);
          for (let i = 0; i < items.length; i++) {
            fs.write(`${dest}/${items()[i]}`, fs.read(`${uri}/${items()[i]}`));
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
        applyItem(dir, (uri) => createNode(uri, fs, signals, owner))(dest);
        setTimeout(changed, 10);
      },
      mkfile: (name: string, data: string | undefined) => {
        const dest = uri !== "/" ? `${uri}/${name}` : name;
        fs.write(dest, data || "");
        signals.set(dest, createSignal<void>(undefined, { equals: false }));        
        applyItem(dir, (uri) => createNode(uri, fs, signals, owner))(dest);        
        setTimeout(changed, 10);
      },
    } as FSDir;
    const effect = on(
      change,
      () => setItems(fs.ls(uri)),
      { defer: true }
    );
    owner
      ? runWithOwner(owner, () => { 
        createEffect(effect);
        items().forEach(applyItem(dir, (uri) => createNode(uri, fs, signals, owner)));
      })
      : (() => {
        createEffect(effect); 
        items().forEach(applyItem(dir, (uri) => createNode(uri, fs, signals, owner)));
      });
    return dir;
  }
};

export const createFileSystem = (adapter: FileSystemAdapter): FileSystem => {
  const signals: FSSignals = new Map();  
  return createNode("", adapter, signals, getOwner()) as FileSystem;
};

export type ObjectFileSystem = { [id: string]: string | ObjectFileSystem };
type ObjectFileSystemItem = ObjectFileSystem | string | undefined;

export const createObjectFileSystem = (
  initial?: ObjectFileSystem,
  storage?: Storage,
  key = "solid-primitive-filesystem"
): FileSystemAdapter => {
  const fs = initial || JSON.parse(storage?.getItem(key) || "{}");
  const save = () => storage?.setItem(key, JSON.parse(fs));
  save();
  const walk = (
    path: string,
    handler: (
      ref: ObjectFileSystemItem,
      part: string,
      index: number,
      parts: string[]
    ) => ObjectFileSystemItem
  ): ObjectFileSystemItem => {
    let ref: ObjectFileSystemItem = fs;
    path.split("/").forEach((part, index, parts) => {
      ref = part ? handler(ref, part, index, parts) : ref;
    });
    return ref;
  };
  return {
    async: false,
    getType: (path: string): "dir" | "file" | undefined => {
      if (path === "" || path === "/") {
        return "dir";
      }
      const item = walk(path, (ref, part) =>
        typeof ref === "object" ? ref[part] : undefined
      );
      return item === undefined
        ? undefined
        : typeof item === "string"
        ? "file"
        : "dir";
    },
    mkdir: (path: string): void =>
      void walk(path, (ref, part, index, parts) => {
        if (typeof ref !== "object") {
          throw new Error(
            `"${parts.slice(0, index).join("/")}" is not a directory`
          );
        }
        if (ref[part] === undefined) {
          ref[part] = {};
        } else if (typeof ref[part] === "string") {
          throw new Error(
            `Cannot overwrite file ${parts
              .slice(0, index + 1)
              .join("/")} with path`
          );
        }
        return ref;
      }) && save(),
    ls: (path: string): [] | [string, ...string[]] => {
      const item = walk(path.replace(/^\/$/, ""), (ref, part, index, parts) => {
        if (typeof ref !== "object") {
          throw new Error(
            `"${parts.slice(0, index).join("/")}" is not a directory`
          );
        }
        return index === 0 && part === "" ? ref : (ref = ref[part]);
      });
      if (typeof item !== "object") {
        throw new Error(`"${path}" is not a directory`);
      }
      return Object.keys(item)
        .map((item: string) => item.startsWith('/') ? item : `/${item}`) as [] | [string, ...string[]];
    },
    rename: (previous: string, next: string): void => {
      let previousPathRef: ObjectFileSystem;
      let previousPathName: string;
      const data = walk(previous, (ref, part, index, parts) => {
        if (typeof ref !== "object") {
          throw new Error(
            `"${parts.slice(0, index).join("/")}" is not a directory`
          );
        }
        if (index + 1 >= parts.length) {
          if (ref[part] === undefined) {
            throw new Error(
              `${previous} does not exist and therefore cannot be renamed`
            );
          } else {
            previousPathRef = ref;
            previousPathName = part;
          }
        }
        return ref[part];
      }) as ObjectFileSystem | string;
      walk(next, (ref, part, index, parts) => {
        if (typeof ref !== "object") {
          throw new Error(
            `"${parts.slice(0, index).join("/")}" is not a directory`
          );
        }
        if (index + 1 >= parts.length) {
          console.log(ref);
          Object.keys(ref).forEach((item) => {
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
          throw new Error(
            `"${parts.slice(0, index).join("/")}" is not a directory`
          );
        }
        if (index + 1 === parts.length) {
          delete ref[part];
          save();
        } else {
          ref = ref[part];
        }
        return ref;
      }),
    read: (path: string): string =>
      walk(path, (ref, part, index, parts) => {
        if (typeof ref !== "object") {
          throw new Error(
            `"${parts.slice(0, index).join("/")}" is not a directory`
          );
        }
        ref = ref[part];
        if (index + 1 === parts.length && typeof ref !== "string") {
          throw new Error(`"${path}" is not a file`);
        }
        return ref;
      }) as string,
    write: (path: string, data: string): void =>
      void walk(path, (ref, part, index, parts) => {
        if (typeof ref !== "object") {
          throw new Error(
            `"${parts.slice(0, index).join("/")}" is not a directory`
          );
        }
        if (index + 1 === parts.length) {
          if (typeof ref[part] === "object") {
            throw new Error(
              `"${path}" is a directory and cannot be overwritten with a file`
            );
          }
          ref[part] = data;
          save();
        } else {
          return (ref = ref[part]);
        }
      }),
  };
};

export const createNoFileSystem = (): SyncFileSystemAdapter => ({
  async: false,
  getType: (_path: string) => undefined,
  mkdir: (_path: string) => undefined,
  ls: (_path: string) => [],
  read: (_path: string) => "",
  rename: (_previous: string, _next: string) => undefined,
  rm: (_path: string) => undefined,
  write: (_path: string, _data: string) => undefined,
});

export const createNodeFileSystem = process.env.SSR ? (): AsyncFileSystemAdapter => {
  const fs = require('fs/promises');
  return {
    async: true,
    getType: (path: string) => fs.stat(path).then((stat: { isDirectory: () => boolean}) =>
      stat.isDirectory() ? "dir" : "file").catch(() => undefined),
    mkdir: (path: string) => fs.mkdir(path, { recursive: true }),
    ls: (path: string) => fs.readdir(path).map((item: string) => item.startsWith('/') ? item : `/${item}`),
    read: (path: string) => fs.readFile(path, { encoding: "utf8" }),
    rename: (previous: string, next: string) => fs.rename(previous, next),
    rm: (path: string) => fs.rm(path, { recursive: true }),
    write: (path: string, data: string) => fs.writeFile(path, { encoding: "utf8" }, data)
  }
} : createNoFileSystem;

// TODO: use WebAPIs for Filesystem access

import type {
  FileEntry,
  FsDirOptions,
} from "@tauri-apps/api/fs";

const taurifs = (globalThis as any).__TAURI__?.fs;

export const createTauriFileSystem = taurifs ? (
  options: FsDirOptions = { dir: taurifs.BaseDirectory.AppData }
): AsyncFileSystemAdapter => ({
  async: true,
  getType: (path: string) => taurifs.exists(path, options)
    .then((present: boolean) =>
      present
      ? taurifs.readDir(path).then(() => "dir" as const).catch(() => "file" as const)
      : undefined),
  mkdir: (path: string) => taurifs.createDir(path, { ...options, recursive: true }),
  ls: (path: string) => taurifs.readDir(path, options).then((entries: FileEntry[]) => entries.reduce(
    (list, entry) => { entry.name && list.push(entry.name); return list },
    [] as string[]
  )),
  read: (path: string) => taurifs.readTextFile(path, options),
  rename: (previous: string, next: string) => taurifs.renameFile(previous, next),
  rm: (path: string) => taurifs.readDir(path)
    .then(() => taurifs.removeDir(path, { ...options, recursive: true }))
    .catch(() => taurifs.removeFile(path, options)),
  write: (path: string, data: string) => taurifs.writeTextFile(path, data)
}) : createNoFileSystem;
