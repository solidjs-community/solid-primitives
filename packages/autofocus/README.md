<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=autofocus" alt="Solid Primitives Autofocus">
</p>

# @solid-primitives/autofocus

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/autofocus?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/autofocus)
[![version](https://img.shields.io/npm/v/@solid-primitives/autofocus?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/autofocus)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives for autofocusing HTML elements.

The native autofocus attribute only works on page load, which makes it incompatible with SolidJS. These primitives run on render, allowing autofocus on initial render as well as dynamically added components.

- [`autofocus`](#autofocus) - Directive to autofocus an element on render.
- [`createAutofocus`](#createautofocus) - Reactive primitive to autofocus an element on render.

## Installation

```bash
npm install @solid-primitives/autofocus
# or
yarn add @solid-primitives/autofocus
# or
pnpm add @solid-primitives/autofocus
```

## `autofocus`

### How to use it

`autofocus` is a ref callback factory. It uses the native `autofocus` attribute to determine whether to focus the element.

```tsx
import { autofocus } from "@solid-primitives/autofocus";

<button ref={autofocus()} autofocus>
  Autofocused
</button>;
```

To conditionally enable autofocus, control the `autofocus` attribute directly — the `autofocus()` ref only focuses when the attribute is present, so removing it is sufficient to opt out:

```tsx
// Conditionally autofocus by toggling the attribute
<button ref={autofocus()} autofocus={shouldFocus()}>
  Maybe Autofocused
</button>;
```

> **Note:** The `enabled` parameter was removed because it was redundant — the same effect is achieved by omitting the `autofocus` attribute. Previously, Solid directives always received an accessor argument whether you used it or not, which gave the impression an explicit toggle was necessary.

### `createAutofocus`

`createAutofocus` reactively autofocuses an element passed in as a signal.

```tsx
import { createAutofocus } from "@solid-primitives/autofocus";

// Using ref
let ref!: HTMLButtonElement;
createAutofocus(() => ref);

<button ref={ref}>Autofocused</button>;

// Using ref signal
const [ref, setRef] = createSignal<HTMLButtonElement>();
createAutofocus(ref);

<button ref={setRef}>Autofocused</button>;
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
