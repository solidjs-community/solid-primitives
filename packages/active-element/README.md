<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Active%20Element" alt="Solid Primitives Active Element">
</p>

# @solid-primitives/active-element

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/active-element?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/active-element)
[![size](https://img.shields.io/npm/v/@solid-primitives/active-element?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/active-element)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

- [`createActiveElement`](#createActiveElement) - A reactive `document.activeElement`. Check which element is currently focused.
- [`createIsElementActive`](#createIsElementActive) - Pass in an element, and see if it's focused.

## Installation

```bash
npm install @solid-primitives/active-element
# or
yarn add @solid-primitives/active-element
```

## `createActiveElement`

A reactive `document.activeElement`. Check which element is currently focused.

### How to use it

```ts
import { createActiveElement } from "@solid-primitives/active-element";

const [activeEl, clear] = createActiveElement();

createEffect(() => {
  console.log(activeEl());
});

// clear all event listeners
clear();
```

### Types

```ts
function createActiveElement(): [getter: Accessor<null | Element>, clear: ClearListeners];
```

## `createIsElementActive`

Pass in an element, and see if it's focused.

### How to use it

```ts
import { createIsElementActive } from "@solid-primitives/active-element";

const [isFocused, clear] = createIsElementActive(() => el);
// "stop" and "start" are for adding and removing event listeners

// you can also use signals for ref
const [ref, setRef] = createSignal<Element>();
const [isFocused] = createIsElementActive(ref);
// this way if the element changes,
// the "isFocused" will start checking the new element

// clear all event listeners
clear();
```

### As Directive

```tsx
import { isElementActive } from "@solid-primitives/active-element";
// prevent tree-shaking
isElementActive;

const [active, setActive] = createSignal(false)

<input use:isElementActive={setActive} />
```

### Types

```ts
function createIsElementActive(
  target: MaybeAccessor<Element>
): [getter: Accessor<boolean>, clear: ClearListeners];

type IsElementActiveProps = (isActive: boolean) => void;
```

## Demo

https://codesandbox.io/s/solid-primitives-active-element-q4kul?file=/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

Initial release as a Stage-2 primitive.

1.0.1

Updated event listener and util dependencies.

1.0.2

Updated to Solid 1.3

</details>
