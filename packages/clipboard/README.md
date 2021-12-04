# @solid-primitives/clipboard

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)

Primitive to that make reading and writing to clipboard easy.

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

### Directive

You can also use clipboard as a convenient directive.

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

1.2.5

Added proper SSR support and modified documentation.

</details>
