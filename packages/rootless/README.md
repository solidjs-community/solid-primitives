<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Rootless" alt="Solid Primitives Rootless">
</p>

# @solid-primitives/rootless

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/rootless?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/rootless)
[![version](https://img.shields.io/npm/v/@solid-primitives/rootless?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/rootless)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A collection of helpers that aim to simplify using reactive primitives outside of reactive roots, asynchronously after the root initialization, or just working with roots in general.

- [`createSubRoot`](#createSubRoot) - Creates a reactive **sub root**, that will be automatically disposed when it's owner does.
- [`createCallback`](#createCallback) - A wrapper for creating callbacks with `runWithOwner`.
- [`runWithRoot`](#runWithRoot) - Use reactive primitives outside of reactive roots.
- [`runWithSubRoot`](#runWithSubRoot) - Like `runWithRoot`, but creates a sub root instead.

## Installation

```bash
npm install @solid-primitives/rootless
# or
yarn add @solid-primitives/rootless
```

## `createSubRoot`

Creates a reactive **sub root**, that will be automatically disposed when it's owner does.

### How to use it

Use it for creating roots nested in other roots.

```ts
import { createSubRoot } from "@solid-primitives/rootless";

createRoot(dispose => {

   createSubRoot(disposeSubRoot => {
      createEffect(...)

      // disposes only the sub root
      disposeSubRoot()
   })

   // disposes the outer root, AND all the nested sub roots
   dispose()
})
```

### Definition

```ts
function createSubRoot<T>(fn: (dispose: () => void) => T, owner?: Owner | null): T;
```

## `createCallback`

A wrapper for creating callbacks with `runWithOwner`.
It gives you the option to use reactive primitives after root setup and outside of effects.

**Why?**

All of the callback-based (in opposite to effect-based) events is Solid don't have a root, because the root is changed synchronously after initialization finishes. So normally that would prevent you from using reactive primitives there.

`runWithOwner` attatches whatever computations created inside, to the owner passed to it.

### How to use it

```tsx
// in component body
const handleClick = createCallback(() => {
   // the effect will be created normally, attached to the component's reactive root
   createEffect(() => {...})
})

// in jsx
<button onClick={handleClick} />
```

### Definition

```ts
const createCallback = <T extends AnyFunction>(
  callback: T,
  owner?: Owner | null
): T
```

## `runWithRoot`

Helper for simplifying usage of Solid's reactive primitives outside of components (reactive roots).

### How to use it

```ts
// when fn doesn't return anything
const dispose = runWithRoot(() =>
  createEffect(() => {
    console.log(count());
  })
);

// when fn returns something
const [double, dispose] = runWithRoot(() => createMemo(() => count() * 2));
```

### Definition

```ts
type runWithRootReturn<T> = T extends void | undefined | null
  ? Dispose
  : [returns: T, dispose: Dispose];
const runWithRoot = <T>(fn: () => T, detachedOwner?: Owner): runWithRootReturn<T>
```

## `runWithSubRoot`

Helper for simplifying usage of Solid's reactive primitives outside of components (reactive roots). A **sub root** will be automatically disposed when it's owner does.

### How to use it

```ts
// when fn doesn't return anything
const dispose = runWithSubRoot(() =>
  createEffect(() => {
    console.log(count());
  })
);

// when fn returns something
const [double, dispose] = runWithSubRoot(() => createMemo(() => count() * 2));
```

### Definition

```ts
type runWithRootReturn<T> = T extends void | undefined | null
  ? Dispose
  : [returns: T, dispose: Dispose];
const runWithSubRoot = <T>(fn: () => T, detachedOwner?: Owner): runWithRootReturn<T>
```

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-1 primitive.

</details>
