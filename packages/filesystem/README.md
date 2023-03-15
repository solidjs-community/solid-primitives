<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=filesystem" alt="Solid Primitives filesystem">
</p>

# @solid-primitives/filesystem

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/filesystem?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/filesystem)
[![version](https://img.shields.io/npm/v/@solid-primitives/filesystem?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/filesystem)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A primitive that allows to manage different file system access methods:

* `createFileSystem` - Provides a reactive interface to one of the file system adapters
* `makeNoFileSystem` - Adapter that provides a synchronous mock file system
* `makeNoAsyncFileSystem` - Adapter that provides an asynchronous mock file system
* `makeVirtualFileSystem` - Adapter that provides a virtual file system that doubles as FsMap for `typescript-vfs` with its `.toMap()` method.
* `makeWebAccessFileSystem` (client only) - Adapter that provides access to the actual filesystem in the browser using a directory picker
* `makeNodeFileSystem` (server only) - Adapter that abstracts the node fs/promises module for the use with this primitive
* `makeTauriFileSystem` (tauri with fs access enabled only) - Adapter that connects to the tauri fs module

## Installation

```bash
npm install @solid-primitives/filesystem
# or
yarn add @solid-primitives/filesystem
# or
pnpm add @solid-primitives/filesystem
```

## How to use it

The synchronous adapters have the following interface:

```tsx
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
```

The asynchronous adapters are returning the same values wrapped in promises:

```ts
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
```

If no rename method is given, mkdir/writeFile/rm are used to achieve the same effect. An actual rename call might be more performant, though.

The `createFileSystem` call then creates a reactive surface above each of these APIs so that the return values of all reading calls are signals for synchronous and resources for asynchronous filesystem adapters; writing methods for asynchronous APIs will return the same promise for convenience reasons. These getters returned from reading methods are bound to Solid's reactivity so that they will automatically cause effects using them outside of untrack() to re-run on updates. Asynchronous getters will initially return undefined, but will update to the correct value once evaluated.

```tsx
const vfs = makeVirtualFileSystem({});
const fs = createFileSystem(vfs);
// create a directory
fs.mkdir("/src");
// create or overwrite a file
fs.writeFile("/src/index.ts", "console.log(0);");
// checking entry type: "file" | "dir" | undefined
const itemType = fs.getType("/src");
createEffect(() => console.log("/src type", itemType()));
// read a directory
const rootEntries = fs.readdir("/");
// will be called again if the contents of "/" change due to
// writing a new file or deleting an existing file or directory
createEffect(() => console.log("/", rootEntries()));
// reading files
const indexText = fs.readFile("/src/index.ts");
// this signal (or resource for async adapters) will update if
// the file is written by the same fs
createEffect(() => console.log("/src/index.ts", indexText()));

const Item = (props: { path: string, fs: SyncFileSystem }) => (
  const itemType = props.fs.getType(props.path);
  const name = () => path.split("/").at(-1);
  const [dirOpen, setDirOpen] = createSignal(false);
  let entries;
  createEffect(() => {
    if (dirOpen() && !entries) {
      entries = props.fs.readDir(path);
    }
  });

  <Switch>
    <Match when={itemType() === "file"}>
      {name()}
    </Match>
    <Match when={itemType() === "dir"}>
      <button onClick={() => setDirOpen(o => !o)}>{dirOpen() ? "-" : "+"}</button>
      <Show when={dirOpen() && entries}>
        <For each={entries()}>
          {(entry) => <div><Item path={entry} fs={props.fs} /></div>}
        </For>
      </Show>
    </Match>
  </Switch>
);
```

## Demo

You may view a working example of createFileSystem/makeVirtualFileSystem/makeWebAccessFileSystem here: 
https://solidjs-community.github.io/solid-primitives/filesystem/

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
