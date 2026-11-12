<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=filesystem" alt="Solid Primitives filesystem">
</p>

# @solid-primitives/filesystem

[![size](https://img.shields.io/badge/size-3.63_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/filesystem)
[![version](https://img.shields.io/npm/v/@solid-primitives/filesystem?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/filesystem)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

A primitive that allows to manage different file system access methods:

- `createFileSystem` - Provides a reactive interface to one of the file system adapters - a convenience method that calls the correct wrapper
- `createSyncFileSystem` - Wraps a synchronous file system adapter like `makeNoFileSystem` or `makeVirtualFileSystem` in a reactive interface
- `createAsyncFileSystem` - Adds a reactive layer to an asynchronous file system adapter
- `makeNoFileSystem` - Adapter that provides a synchronous mock file system
- `makeNoAsyncFileSystem` - Adapter that provides an asynchronous mock file system
- `makeVirtualFileSystem` - Adapter that provides a virtual file system that doubles as `FsMap` for `typescript-vfs` with its `.toMap()` method.
- `makeWebAccessFileSystem` (client only) - Adapter that provides access to the actual file system in the browser using a directory picker or a given `webkitEntry` from an input with the `webkitdirectory` attribute set
- `makeNodeFileSystem` (server only) - Adapter that abstracts the node `fs/promises` module for the use with this primitive
- `makeTauriFileSystem` (`tauri` with `fs` access enabled only) - Adapter that connects to the `tauri fs` module
- `makeChokidarWatcher` - (experimental): use `chokidar` to watch for file system changes and trigger reactive updates
- `rsync` - small tool to copy over recursively from one file system or adapter to another

## Installation

```bash
npm install @solid-primitives/filesystem
# or
yarn add @solid-primitives/filesystem
# or
pnpm add @solid-primitives/filesystem
```

## How to use it

The synchronous adapters, which are primarily meant for virtual file systems or in-memory-databases, have the following interface:

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

To support an unsupported file system, you can provide a wrapper with one of the same APIs.

If no `rename` method is given, `mkdir/writeFile/rm` are used to achieve the same effect. An actual `rename` call will be more performant, though.

The `createFileSystem` call then creates a reactive surface above each of these APIs so that the return values of all reading calls are signals for synchronous and resources for asynchronous file system adapters; writing methods for asynchronous APIs will return the same promise for convenience reasons.

There is experimental support for a watcher as second argument in `createFileSystems`, which triggers reactive updates on external file system changes. Currently, there is only experimental support for `chokidar` for the node file system.

These getters returned from reading methods are bound to Solid's reactivity so that they will automatically cause effects using them outside `untrack()` to re-run on updates. Getters may initially return undefined, but will update to the correct value once evaluated.

```tsx
const vfs = makeVirtualFileSystem({});
const fs = createFileSystem(vfs);
// create a directory
fs.mkdir("/src");
// create or overwrite a file
fs.writeFile("/src/index.ts", "console.log(0);");
// checking entry type: "file" | "dir" | null (file not found) | undefined (not yet ready)
// will be called again if the file or directory is deleted (-> null)
createEffect(() => console.log("/src type", fs.getType("/src")));
// read a directory
// will be called again if the contents of "/" change due to
// writing a new file or deleting an existing file or directory
createEffect(() => console.log("/", fs.readdir("/")));
// reading files
// this signal (or resource for async adapters) will update if
// the file is written by the same fs
createEffect(() => console.log("/src/index.ts", fs.readFile("/src/index.ts")));

// isomorphic file system reader with lazy evaluation
const Item = (props: { path: string; fs: SyncFileSystem | AsyncFileSystem }) => {
  const itemType = () => props.fs.getType(props.path);
  const name = () => getItemName(props.path);
  const [open, setOpen] = createSignal(false);
  const content = () =>
    open()
      ? itemType() === "dir"
        ? props.fs.readdir(props.path)
        : props.fs.readFile(props.path)
      : undefined;

  return (
    <>
      <button onClick={() => setOpen(!open())}>{open() ? "-" : "+"}</button>
      {itemType() === "dir" ? "[DIR]" : "[FILE]"} {name()}
      <Switch>
        <Match when={open() && itemType() === "file"}>
          <pre>{content()?.()}</pre>
        </Match>
        <Match when={open() && itemType() === "dir"}>
          <For each={content() || []}>
            {entry => (
              <div>
                <Item path={entry} fs={props.fs} />
              </div>
            )}
          </For>
        </Match>
      </Switch>
    </>
  );
};
```

### createFileSystem

Wraps any adapter in the matching reactive layer (sync, async or a promise of an async adapter).

```tsx repl
import { render } from "@solidjs/web";
import { For } from "solid-js";
import { createFileSystem, makeVirtualFileSystem } from "@solid-primitives/filesystem";

function Demo() {
  const fs = createFileSystem(makeVirtualFileSystem({ "readme.md": "# Hello" }));
  let n = 0;
  return (
    <>
      <button onClick={() => fs.writeFile(`/note-${++n}.txt`, `note ${n}`)}>Add file</button>
      <ul>
        <For each={fs.readdir("/") ?? []}>{name => <li>{name}</li>}</For>
      </ul>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### createSyncFileSystem

Adds a reactive layer to a synchronous adapter; reads return signal values that update on writes.

```tsx repl
import { render } from "@solidjs/web";
import { createSyncFileSystem, makeVirtualFileSystem } from "@solid-primitives/filesystem";

function Demo() {
  const fs = createSyncFileSystem(makeVirtualFileSystem({ "hello.txt": "Hello!" }));
  return (
    <>
      <input
        value={fs.readFile("/hello.txt") ?? ""}
        onInput={e => fs.writeFile("/hello.txt", e.currentTarget.value)}
      />
      <p>/hello.txt: {fs.readFile("/hello.txt")}</p>
      <p>type: {String(fs.getType("/hello.txt"))}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### createAsyncFileSystem

Adds a reactive layer to an asynchronous adapter; reads are `undefined` until their promise resolves.

```tsx repl
import { render } from "@solidjs/web";
import {
  createAsyncFileSystem,
  makeVirtualFileSystem,
  type AsyncFileSystemAdapter,
} from "@solid-primitives/filesystem";

// a virtual file system with 500ms of artificial latency
const vfs = makeVirtualFileSystem({ "a.txt": "A" });
const later = <T,>(fn: () => T) => new Promise<T>(r => setTimeout(() => r(fn()), 500));
const slowAdapter: AsyncFileSystemAdapter = {
  async: true,
  getType: p => later(() => vfs.getType(p)),
  mkdir: p => later(() => vfs.mkdir(p)),
  readdir: p => later(() => vfs.readdir(p)),
  readFile: p => later(() => vfs.readFile(p)),
  rm: p => later(() => vfs.rm(p)),
  writeFile: (p, data) => later(() => vfs.writeFile(p, data)),
};

function Demo() {
  const fs = createAsyncFileSystem(slowAdapter);
  let n = 0;
  return (
    <>
      <button onClick={() => fs.writeFile(`/file-${++n}.txt`, "")}>Add file</button>
      <p>/: {fs.readdir("/")?.join(", ") ?? "loading…"}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### makeNoFileSystem

A synchronous no-op adapter: nothing is stored, every path is missing and files read as `""`.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { makeNoFileSystem } from "@solid-primitives/filesystem";

function Demo() {
  const fs = makeNoFileSystem();
  const [path, setPath] = createSignal("/a.txt");
  return (
    <>
      <input value={path()} onInput={e => setPath(e.currentTarget.value)} />
      <button onClick={() => fs.writeFile(path(), "ignored")}>Write file</button>
      <p>type: {String(fs.getType(path()))}</p>
      <p>content: "{fs.readFile(path())}"</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### makeNoAsyncFileSystem

The asynchronous counterpart of `makeNoFileSystem`: every method resolves to an empty result.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createFileSystem, makeNoAsyncFileSystem } from "@solid-primitives/filesystem";

function Demo() {
  const adapter = makeNoAsyncFileSystem();
  const fs = createFileSystem(adapter);
  const [writes, setWrites] = createSignal(0);
  const write = async () => {
    await adapter.writeFile("/a.txt", "x");
    setWrites(n => n + 1);
    fs.readdir("/", true); // re-read from the adapter
    fs.readFile("/a.txt", true);
  };
  return (
    <>
      <button onClick={write}>Write /a.txt ({writes()})</button>
      <p>entries in /: {fs.readdir("/")?.length ?? "loading…"}</p>
      <p>/a.txt: "{fs.readFile("/a.txt") ?? "loading…"}"</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### makeVirtualFileSystem

An in-memory synchronous adapter built from a nested object, optionally persisted to a `Storage`.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { makeVirtualFileSystem } from "@solid-primitives/filesystem";

function Demo() {
  const vfs = makeVirtualFileSystem({
    src: { "index.ts": "export const answer = 42;", lib: {} },
    "README.md": "# Project",
  });
  const [path, setPath] = createSignal("/src");
  const view = () => {
    const type = vfs.getType(path());
    if (type === "dir") return vfs.readdir(path()).join(", ");
    return type === "file" ? vfs.readFile(path()) : "(not found)";
  };
  return (
    <>
      <input value={path()} onInput={e => setPath(e.currentTarget.value)} />
      <p>type: {String(vfs.getType(path()))}</p>
      <pre>{view()}</pre>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### Using `makeWebAccessFileSystem` with the origin private file system

Pass the OPFS root as `webkitEntry`. This works in browsers without `showDirectoryPicker`, such as Firefox and Safari. Writing files uses `FileSystemFileHandle.createWritable()`, which Safari only supports from version 26; in older Safari versions, `writeFile` fails while the other operations work.

```ts
const adapter = await makeWebAccessFileSystem({
  webkitEntry: await navigator.storage.getDirectory(),
});
// null on the server
const fs = adapter && createFileSystem(adapter);
```

### Using `makeWebAccessFileSystem` with a `webkitdirectory` input

The previous `<Item>` component can also be used in combination with a file input with the `webkitdirectory` attribute set:

```tsx
const [webkitEntry, setWebkitEntry] = createSignal();
const fs = createMemo(
  () => webkitEntry() && createFileSystem(makeWebAccessFileSystem({ webkitEntry: webkitEntry() })),
);

return (
  <>
    <input
      type="file"
      webkitdirectory
      onChange={e => setWebkitEntry(e.currentTarget.webkitEntry)}
    />
    <Show when={fs()}>
      <Item fs={fs()} path="/" />
    </Show>
  </>
);
```

### rsync

In some cases, you might need to move data from one file system (or adapter) to another one. In order to do so, this package comes with a rsync utility:

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createFileSystem, makeVirtualFileSystem, rsync } from "@solid-primitives/filesystem";

function Demo() {
  const src = makeVirtualFileSystem({ "a.txt": "A", docs: { "b.md": "# B" } });
  const dest = createFileSystem(makeVirtualFileSystem({}));
  const [status, setStatus] = createSignal("idle");
  const sync = () =>
    rsync(src, "/", dest, "/").then(
      () => setStatus("done"),
      e => setStatus(`failed: ${e}`),
    );
  return (
    <>
      <button onClick={sync}>rsync src → dest</button>
      <p>status: {status()}</p>
      <p>dest /: {dest.readdir("/")?.join(", ") || "(empty)"}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
rsync(srcFs, srcPath, destFs, destPath): Promise<void>;
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
