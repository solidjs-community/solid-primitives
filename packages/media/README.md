# @solid-primitives/media

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/media?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/media)
[![size](https://img.shields.io/npm/v/@solid-primitives/media?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/media)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Creates a very simple and straightforward media query monitor.

## Installation

```
npm install @solid-primitives/media
# or
yarn add @solid-primitives/media
```

## How to use it

```ts
const isSmall = createMediaQuery("(max-width: 767px)");
console.log(isSmall());
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-media-query-5bf16?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release.

1.0.0

Shipped first stable version.

1.1.7

Published with CJS and SSR support.

1.1.10

Added server entry and updated to latest Solid.

1.1.11

Removed onMount and returned the current media query immediately as opposed to onEffect.

</details>
