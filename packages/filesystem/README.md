<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=filesystem" alt="Solid Primitives filesystem">
</p>

# @solid-primitives/filesystem

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/filesystem?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/filesystem)
[![version](https://img.shields.io/npm/v/@solid-primitives/filesystem?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/filesystem)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A primitive that allows to manage different file system access methods:

`createFilesystem` - Provides an interface to one or more file system APIs

## Installation

```bash
npm install @solid-primitives/filesystem
# or
yarn add @solid-primitives/filesystem
# or
pnpm add @solid-primitives/filesystem
```

## How to use it

```tsx
const fs = createFileSystem(...adapters);
// add a directory
fs.mkdir("src");
// add a file
fs["/src"].mkfile("index.ts", "");
// read directories and files
fs;
// { ["/src"]: ..., items: ["/src"], length: 1, rename: (name) => void, delete: () => void, type: "dir" };
fs()["/src"];
// { ["/index.ts"]: ..., items: ["/index.ts"], length: 1, rename: (name) => void, delete: () => void, type: "dir" };
fs()["/src"]["/index.ts"];
// { uri: "/index.ts", data: Accessor<string>, setData: Setter<string>, rename: (name) => void, delete: () => void, type: "file" };
fs()["/src"]["index.ts"].rename("index.tsx");

const Item = (props) => (
  <Show when={props.type === "dir"} fallback={props.fs.uri}>
    <For each={props.fs.items}>
      {(item) => <div><Item fs={props.fs[item]} /></div>}
    </For>
  </Show>
);
```

## Demo

You can use this template for publishing your demo on CodeSandbox: https://codesandbox.io/s/solid-primitives-demo-template-sz95h

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
