---
Name: clipboard
Stage: 3
Package: "@solid-primitives/clipboard"
Primitives: createClipboard, copyToClipboard
Category: Browser APIs
---

# @solid-primitives/clipboard

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)

Primitives to that make reading and writing to clipboard easy.

## Installation

```bash
npm install @solid-primitives/clipboard
# or
yarn add @solid-primitives/clipboard
```

## How to use it

```ts
const [clipboard, setClipboard] = createClipboard();
```

or using a directive:

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

1.0.6

Added CJS export and removed outdated permision structure.

</details>
