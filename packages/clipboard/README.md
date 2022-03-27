# @solid-primitives/clipboard

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/clipboard?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/clipboard)
[![size](https://img.shields.io/npm/v/@solid-primitives/clipboard?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/clipboard)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitive to that make reading and writing to single or multiple values to clipboard easy. It also comes with a convenient directive to write to clipboard.

## Installation

```bash
npm install @solid-primitives/clipboard
# or
yarn add @solid-primitives/clipboard
```

## How to use it

### createClipboard

Clipboard exports a read and write function. Note the write function is exported first for convenience as the most common use case for this primitive.

```ts
const [setClipboard, clipboard] = createClipboard();
setClipboard("foobar");
```

### copyToClipboard

You can also use clipboard as a convenient directive for setting the clipboard value.

```ts
import { copyToClipboard } from "@solid-primitives/clipboard";
<input type="text" use:copyToClipboard={{ highlight: true }} />;
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-clipboard-g14dh?file=/src/clipboard.ts

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

Committing first version of primitive.

1.2.7

Added proper SSR support and modified documentation.

1.2.8

Upgraded to Solid 1.3

</details>
