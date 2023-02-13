<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=autofocus" alt="Solid Primitives Autofocus">
</p>

# @solid-primitives/autofocus

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/autofocus?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/autofocus)
[![version](https://img.shields.io/npm/v/@solid-primitives/autofocus?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/autofocus)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives for autofocusing HTML elements.

- `autofocus` - Directive to autofocus an element on render.
- `createAutofocus` - Reactive primitive to autofocus an element on render.

## Installation

```bash
npm install @solid-primitives/autofocus
# or
yarn add @solid-primitives/autofocus
# or
pnpm add @solid-primitives/autofocus
```

## How to use it

### use:autofocus

```ts
import { autofocus } from "@solid-primitives/autofocus";

<button use:autofocus autofocus={true}>
  Autofocused
</button>;
```

The `autofocus` directive uses the native `autofocus` attribute to determine it should focus the element or not.
Using this directive without `autofocus={true}` (or the shorthand `autofocus`) will not perform anything.

### createAutofocus

```ts
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

```ts
createAutofocus(ref: Accessor<HTMLElement | undefined>, autofocus: boolean = true);

createAutofocus(ref, false); // Will not autofocus
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
