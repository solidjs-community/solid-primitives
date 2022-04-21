<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Selection" alt="Solid Primitives Selection">
</p>

# @solid-primitives/selection

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/selection?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/selection)
[![version](https://img.shields.io/npm/v/@solid-primitives/selection?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/selection)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitive that helps reading/setting cursor position and selections both in text fields and contenteditable elements.

## Installation

```bash
npm install @solid-primitives/selection
# or
yarn add @solid-primitives/selection
```

## Usage


```ts
import { createSelection } from "@solid-primitives/selection";

const [selection, setSelection] = createSelection();

selection(); // [HTMLDivElement, 1, 3]
setSelection([document.querySelector('input'), 3, 3]);
```

Gets and sets the selection. Handles input, textarea, contentEditable elements and plain text. Use it to manipulate or keep the cursor / selection when overwriting values or innerHTML. In order to use it with an input mask to apply it to a contentEditable element, you can use:

```ts
import { createSelection } from "@solid-primitives/selection";
import { anyMaskToFn } from "@solid-primitives/input-mask";

const [selection, setSelection] = createSelection();

const ibanMask = anyMaskToFn('aa99999999999999999999');

const inputMaskHandler = (ev) => {
  const [node, start, end] = selection();
  if (ev.currentTarget === node) {
    const [value, selection] = ibanMask(node.innerHTML, [start, end]);
    node.innerHTML = value;
    setSelection(node, selection[0], selection[1]);
  }
};

return <div contenteditable onInput={inputMaskHandler}></div>
```

### DEMO

TODO

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-0 primitive.

</details>
