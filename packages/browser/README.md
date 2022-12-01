<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=browser" alt="Solid Primitives browser">
</p>

# @solid-primitives/browser

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/browser?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/template-primitive)
[![version](https://img.shields.io/npm/v/@solid-primitives/browser?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/template-primitive)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fbrowser%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

- `createWebShare` - that can create a web share and returns a signal track the status. You can use this to share `title`, `text`, `url` or `files`.

## Installation

```bash
npm install @solid-primitives/browser
# or
yarn add @solid-primitives/browser
# or
pnpm add @solid-primitives/browser
```

## Web Share

If you want to share `text`, `title`, `url` or `files`, you can use `createWebShare`.

```ts
const shareStatus = createWebShare({ url: "https://www.solidjs.com/", title: "title", text: "text" });
createEffect(() => {
  if (shareStatus() === "fulfilled") {
    console.log("successful sharing.");
  }
});
```

## Demo

TODO

## Changelog

TODO
