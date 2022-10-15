<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Rootless" alt="Solid Primitives Rootless">
</p>

# @solid-primitives/rootless

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/rootless?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/rootless)
[![version](https://img.shields.io/npm/v/@solid-primitives/rootless?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/rootless)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A collection of helpers that aim to simplify using reactive primitives outside of reactive roots, and managing disposal of reactive roots.

- [`createSubRoot`](#createSubRoot) - Creates a reactive **sub root**, that will be automatically disposed when it's owner does.
- [`createCallback`](#createCallback) - A wrapper for creating callbacks with `runWithOwner`.
- [`createDisposable`](#createDisposable) - For disposing computations early – before the root cleanup.
- [`createSharedRoot`](#createSharedRoot) - Share "global primitives" across multiple reactive scopes.

## Installation

```bash
npm install @solid-primitives/rootless
# or
yarn add @solid-primitives/rootless
```

## `createSubRoot`

###### Previously `createSubRoot`

Creates a reactive **root branch**, that will be automatically disposed when it's owner does.

### How to use it

Use it for nested roots _(literally nested, or provided manually to dependency array)_ that should be disposed before or with their owner.

```ts
import { createSubRoot } from "@solid-primitives/rootless";

createRoot(dispose => {
  createSubRoot(disposeBranch => {
    // computations will be disposed with branch
    createEffect(() => {...});

    // disposes only the branch
    disposeBranch();
  });

  // disposes the outer root, AND all the nested branches
  dispose();
});
```

### Definition

```ts
function createSubRoot<T>(fn: (dispose: VoidFunction) => T, ...owners: (Owner | null)[]): T;
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
function createCallback<T extends AnyFunction>(callback: T, owner?: Owner | null): T;
```

## `createDisposable`

###### Previously `runWithSubRoot`

For disposing computations early – before the root cleanup.

### How to use it

Executes provided function in a [`createSubRoot`](#createSubRoot) _(auto-disposing root)_, and returns a dispose function, to dispose computations used inside before automatic cleanup.

```ts
const dispose = createDisposable(dispose => {
   createEffect(() => {...})
});

// dispose later (if not, will dispose automatically)
dispose()
```

### Definition

```ts
type runWithRootReturn<T> = T extends void | undefined | null
  ? Dispose
  : [returns: T, dispose: Dispose];
const createDisposable = <T>(fn: () => T, detachedOwner?: Owner): runWithRootReturn<T>
```

## `createSharedRoot`

###### Added in `@1.1.0`

Creates a reactive root that is shared across every instance it was used in. Shared root gets created when the returned function gets first called, and disposed when last reactive context listening to it gets disposed. Only to be recreated again when a new listener appears.

Designed to make "global primitives" shareable, without instanciating them (recreating, state, computations, event listeners, etc.) every time they're used. For example a `createLocationState` primitive would work the same for every instance and provide the same data, so reinitializeing it every time is wastefull.

### How to use it

`createSharedRoot` primitive takes a single argument:

- `factory` - a function where can you initialize some reactive primitives, returned value will be shared across instances.

And returns a function registering reactive owner as one of the listeners, returns the value `factory` function returned.

```ts
import { createSharedRoot } from "@solid-primitives/rootless";

const useState = createSharedRoot(() => {
   return createMemo(() => {...})
});

// later in a component:
const state = useState();
state()

// in another component
// previously created primitive would get reused
const state = useState();
...
```

### Type Definition

```ts
function createSharedRoot<T>(factory: (dispose: Fn) => T): () => T;
```

### Demo

Usage of combining `createSharedRoot` with `createMousePosition`: https://codesandbox.io/s/shared-root-demo-fjl1l9?file=/index.tsx

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
