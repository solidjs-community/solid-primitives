import { isServer } from "solid-js/web";
import { type DirEntries, type FSAdapter } from "./types.js";

/**
 * Adapter that provides high-performance access to the Origin Private File System (OPFS)
 * via `navigator.storage.getDirectory()`.
 *
 * Unlike user-picker File System Access APIs, OPFS requires zero permission prompts, is fully isolated
 * to the origin, and supports fast local-first binary & text storage (ideal for SQLite WASM, caches, audio stems).
 */
export const makeOpfsFileSystem = async (): Promise<FSAdapter | null> => {
  if (
    isServer ||
    typeof navigator === "undefined" ||
    !("storage" in navigator) ||
    typeof navigator.storage.getDirectory !== "function"
  ) {
    return null;
  }

  const root: FileSystemDirectoryHandle = await navigator.storage.getDirectory();

  const walk = async (
    path: string,
    handler: (
      handle: FileSystemDirectoryHandle | FileSystemFileHandle,
      part: string,
      index: number,
      parts: string[],
    ) => Promise<void | FileSystemDirectoryHandle | FileSystemFileHandle | undefined> | undefined,
  ): Promise<FileSystemDirectoryHandle | FileSystemFileHandle | undefined> => {
    const parts = path.split("/").filter(Boolean);
    let currentHandle: FileSystemDirectoryHandle | FileSystemFileHandle | undefined = root;
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
    async: true as const,
    getType: async (path: string) =>
      walk(path, getNext)
        .then(handle => (handle?.kind === "directory" ? "dir" : handle?.kind || null))
        .catch(() => null),
    readdir: async (path: string) =>
      walk(path, getNext).then(async handle => {
        if (handle?.kind !== "directory") {
          return [];
        }
        const items: string[] = [];
        for await (const name of (handle as any).keys()) {
          items.push(name);
        }
        return items as DirEntries;
      }),
    mkdir: async (path: string) => {
      await walk(path, (handle, part, index, parts) =>
        handle.kind === "file"
          ? Promise.reject(
              new Error(
                `attempt to create directory "${path}" failed - "${parts
                  .slice(0, index)
                  .join("/")}" is a file`,
              ),
            )
          : handle.getDirectoryHandle(part, { create: true }),
      );
    },
    readFile: async (path: string) =>
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
    writeFile: async (path: string, data: string) =>
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
    rm: async (path: string) =>
      void (await walk(path, (handle, part, index, parts) =>
        index < parts.length - 1
          ? getNext(handle, part)
          : handle.kind === "directory"
            ? handle.removeEntry(part, { recursive: true })
            : Promise.reject(new Error(`${path} not found; could not be removed`)),
      )),
  };
};
