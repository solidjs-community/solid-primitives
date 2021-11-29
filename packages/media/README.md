---
Name: media
Package: "@solid-primitives/media"
Primitives: createMediaQuery
Category: Display & Media
---

# @solid-primitives/media

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/media?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/media)
[![size](https://img.shields.io/npm/v/@solid-primitives/media?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/media)

Creates a very simple and straightforward media query monitor.

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

1.1.5

Published with CJS export.

</details>
