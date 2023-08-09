import type { ItemType } from "./types.js";
import { getParentDir } from "./tools.js";

export type ObjectFileSystem = { [id: string]: string | ObjectFileSystem };
export type ObjectFileSystemItem = ObjectFileSystem | string | undefined;

/**
 * Creates a virtual file system adapter
 * @param initial optional object to prefill the file system
 * @param storage optional localStorage/localForage type storage
 * @param key optional key in the storage
 *
 * ⚠ Warning! localStorage is limited to 5MB; use [localforage](https://localforage.github.io/localForage/) instead if you need more.
 */
export const makeVirtualFileSystem = (
  initial?: ObjectFileSystem,
  storage?: Storage,
  key = "solid-primitive-filesystem",
) => {
  let storedValue;
  const storageValue = storage?.getItem(key);
  try {
    storedValue = JSON.parse(typeof storageValue === "string" ? storageValue : "null");
  } catch (e) {}
  let fs = storedValue || initial || {};
  if ((storageValue as unknown) instanceof Promise) {
    (storageValue as unknown as Promise<string>).then(storedValue => {
      fs = Object.assign(storedValue || {}, fs);
    });
  }
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
      return item === undefined ? null : typeof item === "string" ? "file" : "dir";
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
