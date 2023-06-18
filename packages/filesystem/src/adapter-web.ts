///<reference path="../node_modules/@types/wicg-file-system-access/index.d.ts" />
import { isServer } from "solid-js/web";
import { DirEntries } from "./types";

/**
 * Adapter that provides access to the actual filesystem in the browser using a directory picker
 * receives the options for showDirectoryPicker(options: DirectoryPickerOptions) as optional argument
 *
 * relies on https://wicg.github.io/file-system-access/ - basic api (https://caniuse.com/native-filesystem-api)
 */
export const makeWebAccessFileSystem = isServer
  ? () => Promise.resolve(null)
  : typeof globalThis.showDirectoryPicker === "function"
  ? async (
      options?: DirectoryPickerOptions | { webkitEntry: FileSystemDirectoryHandle } | undefined,
    ) => {
      const handle =
        (options as { webkitEntry: FileSystemDirectoryHandle })?.webkitEntry ||
        (await globalThis.showDirectoryPicker(options));
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
            for await (const name of handle.keys()) {
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
                      .join("/")} is a file`,
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
    }
  : () => Promise.resolve(null);
