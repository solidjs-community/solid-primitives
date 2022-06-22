<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Clipboard" alt="Solid Primitives Clipboard">
</p>

# @solid-primitives/clipboard

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/clipboard?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/clipboard)
[![size](https://img.shields.io/npm/v/@solid-primitives/clipboard?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/clipboard)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitive to that make reading and writing to single or multiple values to clipboard easy. It also comes with a convenient directive to write to clipboard.

## Installation

```bash
npm install @solid-primitives/clipboard
# or
yarn add @solid-primitives/clipboard
```

## How to use it

### makeClipboard

A basic non-reactive primitive that makes accessing the clipboard easy. Note that write supports both string and ClipboardItems object structure.

```ts
const [write, read, newItem] = makeClipboard();
```

#### Definition

```ts
function makeClipboard(): [
  write: ClipboardSetter,
  read: () => Promise<ClipboardItems | undefined>,
  newItem: NewClipboardItem
];
```

### createClipboard

Clipboard exports a read and write function. Note the write function is exported first for convenience as the most common use case for this primitive.

```ts
const [data, setData] = createSignal('Hello);
const [clipboard, refresh] = createClipboard(data);
setData("foobar");
console.log(clipboard);
```

Note: The primitive binds and listens for `clipboardchange` meaning that clipboard changes should automatically propagate. The implementation however is buggy on certain browsers.

#### Definition

```ts
function createClipboard(
  data: Accessor<string | ClipboardItem[]>
): [clipboard: Resource<ClipboardItems | undefined>, read: VoidFunction];
```

### copyToClipboard

You can also use clipboard as a convenient directive for setting the clipboard value.

```ts
import { copyToClipboard } from "@solid-primitives/clipboard";
<input type="text" use:copyToClipboard={{ highlight: true }} />;
```

#### Definition

```ts
function copyToClipboard(el: Element, options: () => CopyToClipboardOptions | true);
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

1.2.9

Upgraded to Solid 1.3

1.3.0

Update clipboard to the new Primitives project structure.

1.4.0

Add `make` and separate `create` primitives to follow new library standards.

</details>
