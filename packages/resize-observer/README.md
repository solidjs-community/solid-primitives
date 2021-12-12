# solid-primitives/resize-observer

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/resize-observer?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/resize-observer)
[![size](https://img.shields.io/npm/v/@solid-primitives/resize-observer?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/resize-observer)

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

</details>

## Contributors

Thanks to Moshe Udimar for this contribution!
