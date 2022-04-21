<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Active%20Element" alt="Solid Primitives Active Element">
</p>

# @solid-primitives/active-element

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/active-element?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/active-element)
[![size](https://img.shields.io/npm/v/@solid-primitives/active-element?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/active-element)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

- [`newActiveElementListener`](#newActiveElementListener) - Listen for changes to the `document.activeElement`.
- [`createActiveElement`](#createActiveElement) - Provides reactive signal of `document.activeElement`.
- [`newFocusListener`](#newFocusListener) - Attaches "blur" and "focus" event listeners to the element.
- [`createFocusSignal`](#createFocusSignal) - Provides a signal representing element's focus state.
- [`focus`](#focus) - A directive that notifies you when the element becomes active or inactive.

## Installation

```bash
npm install @solid-primitives/active-element
# or
yarn add @solid-primitives/active-element
```

## `newActiveElementListener`

Attaches event listeners to window, listening for the changes of the `document.activeElement`.

```ts
import { newActiveElementListener } from "@solid-primitives/active-element";

const [activeElement, setActiveElement] = createSignal(null);
const clear = newActiveElementListener(el => setActiveElement(el));

// remove listeners (happens also on cleanup)
clear();
```

#### Definition

```ts
function newActiveElementListener(callback: (element: Element | null) => void): VoidFunction;
```

## `createActiveElement`

Provides reactive signal of `document.activeElement`. Check which element is currently focused.

#### How to use it

```ts
import { createActiveElement } from "@solid-primitives/active-element";

const activeEl = createActiveElement();

createEffect(() => {
  console.log(activeEl()); // T: Element | null
});
```

#### Definition

```ts
function createActiveElement(): Accessor<Element | null>;
```

## `newFocusListener`

Attaches "blur" and "focus" event listeners to the element.

```ts
import { newFocusListener } from "@solid-primitives/active-element";

const [isFocused, setIsFocused] = createSignal(false)
const clear = newFocusListener(focused => setIsFocused(focused));

// remove listeners (happens also on cleanup)
clear();
```

#### Definition

```ts
function newFocusListener(target: Element, callback: (isActive: boolean) => void): VoidFunction;
```

## `createFocusSignal`

Provides a signal representing element's focus state.

#### How to use it

```tsx
import { createFocusSignal } from "@solid-primitives/active-element";

const isFocused = createFocusSignal(el);
isFocused() // T: boolean

// you can also use signals for ref
const [ref, setRef] = createSignal<Element>(el);
const isFocused = createFocusSignal(ref);
// this way if the element changes,
// the "isFocused" will start checking the new element

// is targeting a ref from jsx, pass it as a function
// or wrap primitive in onMount, so that it is accessed once mounted
let ref
createFocusSignal(() => ref);
<div ref={ref}/>
```

#### Definition

```ts
function createFocusSignal(target: MaybeAccessor<Element>): Accessor<boolean>;
```

## `focus`

A directive that notifies you when the element becomes active or inactive.

```tsx
const [active, setActive] = createSignal(false)
<input use:focus={setActive} />
```

#### Definition

```ts
Directive<(isActive: boolean) => void>
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

2.0.0 - **stage-3**

Renamed `createIsElementActive` to `createFocusSignal` nad `isElementActive` directive to `focus`.

Add `newActiveElementListener` & `newFocusListener` non-reactive primitives.

Removed clear() functions from reactive primitives.

</details>
