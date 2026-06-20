<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Deep" alt="Solid Primitives Deep">
</p>

# @solid-primitives/deep

[![size](https://img.shields.io/badge/size-1.3_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/deep)
[![version](https://img.shields.io/npm/v/@solid-primitives/deep?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/deep)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Primitives for tracking and observing nested reactive objects in Solid.

- [`trackDeep`](#trackdeep) - Tracks all properties of a store by iterating over them recursively.
- [`trackStore`](#trackstore) - A more performant alternative to `trackDeep` utilizing specific store implementations.
- [`captureStoreUpdates`](#capturestoreupdates) - A utility function that captures all updates to a store and returns them as an array.

## Comparison with Solid's built-in `deep`

Solid 2.0 ships a `deep` helper in `solid-js` that tracks all nested properties of a store and returns a **plain snapshot** — a non-reactive copy suitable for serialization:

```ts
import { deep } from "solid-js";

createEffect(
  () => deep(store),
  snapshot => localStorage.setItem("state", JSON.stringify(snapshot))
);
```

This package complements that with three distinct utilities:

| | Solid's `deep` | `trackDeep` | `trackStore` | `captureStoreUpdates` |
|---|---|---|---|---|
| Tracks all nested changes | ✓ | ✓ | ✓ | ✓ |
| Returns live store proxy | — | ✓ | ✓ | — |
| Returns plain snapshot | ✓ | — | — | — |
| Works on plain objects wrapping stores | — | ✓ | — | — |
| Reports what changed and where | — | — | — | ✓ |

**Use Solid's `deep`** when you want to observe all changes and immediately consume a serializable value (e.g. persist to localStorage, send over the wire).

**Use `trackDeep` or `trackStore`** when you need the live reactive proxy back — for example, to pass it reactively to another primitive, or when you want to decide what to do with the store rather than serialize it immediately. `trackStore` is preferred for large or frequently updated stores due to its use of memoized structural subscriptions; `trackDeep` additionally accepts plain objects that contain stores.

**Use `captureStoreUpdates`** when you need to know _what_ changed and _where_ — it returns an array of `{ path, value }` deltas since the last call. Solid's `deep` has no equivalent for this.

## Installation

```bash
npm install @solid-primitives/deep
# or
yarn add @solid-primitives/deep
# or
pnpm add @solid-primitives/deep
```

## `trackDeep`

Tracks all properties of a store by iterating over them recursively.

It's a slightly more performant alternative to tracing a store with `JSON.stringify`, that won't throw when encountering circular references or `BigInt` values.

Since it iterates over all properties of a store, it's not recommended to use this on large stores under rapid updates.

### How to use it

You can call this function with any store under a tracking scope and it will iterate over all properties of the store and track them.

```ts
import { trackDeep } from "@solid-primitives/deep";

const [state, setState] = createStore({ name: "John", age: 42 });

createEffect(
  () => trackDeep(state),
  () => {
    /* execute some logic whenever the state changes */
  }
);
```

Or since this has a composable design, you can create _derivative_ functions and use them similar to derivative signals.

```ts
const deeplyTrackedStore = () => trackDeep(sign);
createEffect(
  () => deeplyTrackedStore(),
  //    ^ this causes a re-execution of the effect on deep changes of properties
  value => console.log("Store is:", value)
);
```

`trackDeep` will traverse any "wrappable" object _(objects that solid stores will wrap with proxies)_, even if it's not a solid store.

```ts
createEffect(() => {
  // will also work:
  trackDeep({ myStore: state });
});
```

> **Warning** If you `snapshot` a store, it will no longer be tracked by `trackDeep` nor `trackStore`!

```ts
import { snapshot } from "solid-js";

const plain = snapshot(state);

createEffect(
  () => trackDeep(plain), // This will NOT work — plain objects are not reactive
  () => {}
);
```

## `trackStore`

A much more performant alternative to `trackDeep` that is utilizing memoization and specific store implementations of solid stores.

You should consider using this instead of other tracking methods, for large stores, stores that are updated rapidly or tracked in many effects.

### How to use it

It can be used in almost the same way as `trackDeep`, the only difference is that it requires a store to be directly passed in. So it won't work with objects that contain stores.

```ts
import { trackStore } from "@solid-primitives/deep";

const [state, setState] = createStore({ name: "John", age: 42 });

createEffect(
  () => trackStore(state),
  () => {
    /* execute some logic whenever the state changes */
  }
);
```

## `captureStoreUpdates`

Creates a function for tracking and capturing updates to a store.

It could be useful for implementing [undo/redo functionality](https://primitives.solidjs.community/package/history) or for turning a store into a immutable stream of updates.

### How to use it

Each execution of the returned function will return an array of updates to the store since the last execution.

```ts
const [state, setState] = createStore({ todos: [] });

const getDelta = captureStoreUpdates(state);

getDelta(); // [{ path: [], value: { todos: [] } }]

setState(s => { s.todos = ["foo"]; });

getDelta(); // [{ path: ["todos"], value: ["foo"] }]
```

The returned function will track all updates to a store (just like [`trackStore`](#trackstore)), so it can be used inside a tracking scope.

```ts
const [state, setState] = createStore({ todos: [] });

const getDelta = captureStoreUpdates(state);

createEffect(
  () => getDelta(),
  delta => {
    /* execute some logic whenever the state changes */
    console.log(delta);
  }
);
```

The returned function is not a signal - it won't get updated by itself, it has to be called manually, or under a tracking scope to capture new updates.

But it can be turned into a signal by using `createMemo`:

```ts
const [state, setState] = createStore({ todos: [] });

const delta = createMemo(captureStoreUpdates(state));

// both of these effects will receive the same delta
createEffect(
  () => delta(),
  value => console.log(value)
);
createEffect(
  () => delta(),
  value => console.log(value)
);
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
