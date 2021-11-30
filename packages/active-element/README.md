---
Name: active-element
Stage: 2
Package: "@solid-primitives/active-element"
Primitives: createActiveElement, createIsElementActive
Category: Inputs
---

# @solid-primitives/active-element

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/active-element?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/active-element)
[![size](https://img.shields.io/npm/v/@solid-primitives/active-element?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/active-element)

- [`createActiveElement`](#createActiveElement) - A reactive `document.activeElement`. Check which element is currently focused.
- [`createIsElementActive`](#createIsElementActive) - Pass in an element, and see if it's focused.

## `createActiveElement`

A reactive `document.activeElement`. Check which element is currently focused.

### Usage

```ts
import { createActiveElement } from "@solid-primitives/active-element";

const [activeEl, { stop, start }] = createActiveElement();
// "stop" and "start" are for adding and removing event listeners
```

### Types

```ts
function createActiveElement(): [
  getter: Accessor<null | Element>,
  actions: { stop: Fn; start: Fn }
];
```

## `createIsElementActive`

Pass in an element, and see if it's focused.

### Usage

```ts
import { createIsElementActive } from "@solid-primitives/active-element";

const [isFocused, { stop, start }] = createIsElementActive(() => el);
// "stop" and "start" are for adding and removing event listeners

// you can also use signals for ref
const [ref, setRef] = createSignal<Element>();
const [isFocused] = createIsElementActive(ref);
// this way if the element changes,
// the "isFocused" will start checking the new element
```

### Types

```ts
function createIsElementActive(
  target: MaybeAccessor<Element>
): [getter: Accessor<boolean>, actions: { stop: Fn; start: Fn }];
```

## Demo

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

Initial release as a Stage-2 primitive.

</details>
