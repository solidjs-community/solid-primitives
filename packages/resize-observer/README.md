# @solid-primitives/resize-observer

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/resize-observer?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/resize-observer)
[![size](https://img.shields.io/npm/v/@solid-primitives/resize-observer?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/resize-observer)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Provides a reactive resize observer wrapper.

## Installation

```
npm install @solid-primitives/resize-observer
# or
yarn add @solid-primitives/resize-observer
```

## How to use it

### createResizeObserver

Main resize observer primitive.

```ts
const refCallback = createResizeObserver(() => console.log("resized"));
```

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial commit of the resize observer.

1.0.3

Release initial version for CJS and SSR support.

1.0.4

Patched HTMLElement to Element to resolve type error on buildd. Updated to Solid 1.3.

</details>

## Contributors

Thanks to Moshe Udimar for this contribution!
