<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Deep" alt="Solid Primitives Deep">
</p>

# @solid-primitives/deep

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/deep?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/deep)
[![version](https://img.shields.io/npm/v/@solid-primitives/deep?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/deep)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives for tracking changes in stores.

- [`trackDeep`](#trackDeep) - Tracks all properties of a store by iterating over them recursively.
- [`trackStore`](#trackStore) - A more performant alternative to `trackDeep` utilizing specific store implementations.

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

const [state, setState] = createSignal({ name: "John", age: 42 });

createEffect(() => {
  trackDeep(state);
  /* execute some logic whenever the state changes */
});
```

Or since this has a composable design, you can create _derivative_ functions and use them similar to derivative signals.

```ts
const deeplyTrackedStore = () => trackDeep(sign);
createEffect(() => {
  console.log("Store is: ", deeplyTrackedStore());
  //                        ^ this causes a re-execution of the effect on deep changes of properties
});
```

`trackDeep` will traverse any "wrappable" object _(objects that solid stores will wrap with proxies)_, even if it's not a solid store.

```ts
createEffect(() => {
  // will also work:
  trackDeep({ myStore: state });
});
```

> **Warning** If you `unwrap` a store, it will no longer be tracked by `trackDeep` nor `trackStore`!

```ts
const unwrapped = unwrap(state);

createEffect(() => {
  // This will NOT work:
  trackDeep(unwrapped);
});
```

## `trackStore`

A much more performant alternative to `trackDeep` that is utilizing memoization and specific store implementations of solid stores.

You should consider using this instead of other tracking methods, for large stores, stores that are updated rapidly or tracked in many effects.

### How to use it

It can be used in almost the same way as `trackDeep`, the only difference is that it requires a store to be directly passed in. So it won't work with objects that contain stores.

```ts
import { trackStore } from "@solid-primitives/deep";

const [state, setState] = createSignal({ name: "John", age: 42 });

createEffect(() => {
  trackStore(state);
  /* execute some logic whenever the state changes */
});
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
