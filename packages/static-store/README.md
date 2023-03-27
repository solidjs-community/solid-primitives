<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=static-store" alt="Solid Primitives static-store">
</p>

# @solid-primitives/static-store

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/static-store?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/static-store)
[![version](https://img.shields.io/npm/v/@solid-primitives/static-store?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/static-store)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives for creating small reactive objects that doesn't change their shape over time - don't need a proxy wrapper.

- [`createStaticStore`](#createStaticStore) - Creates a writable static store object.
- [`createDerivedStaticStore`](#createDerivedStaticStore) - Creates a static store that is derived from a source function.

## Installation

```bash
npm install @solid-primitives/static-store
# or
yarn add @solid-primitives/static-store
# or
pnpm add @solid-primitives/static-store
```

## `createStaticStore`

A shallowly wrapped reactive store object. It behaves similarly to the createStore, but with limited features to keep it simple. Designed to be used for reactive objects with static keys, but dynamic values, like reactive Event State, location, etc.

### How to use it

It takes a single argument - an initial value. It returns a tuple with the store object and a setter function.

```ts
import { createStaticStore } from "@solid-primitives/static-store";

const [size, setSize] = createStaticStore({ width: 0, height: 0 });

el.addEventListener("resize", () => {
  setSize({ width: el.offsetWidth, height: el.offsetHeight });
});

createEffect(() => {
  console.log(size.width, size.height);
});
```

### `createHydratableStaticStore`

A hydratable version of the [`createStaticStore`](#createStaticStore). It will use the `serverValue` on the server and the `update` function on the client. If initialized during hydration it will use `serverValue` as the initial value and update it once hydration is complete.

```ts
import { createHydratableStaticStore } from "@solid-primitives/static-store";

// reads from the DOM
const getSize = () => ({ width: el.offsetWidth, height: el.offsetHeight });

const [size, setSize] = createHydratableStaticStore(
  // server fallback value
  { width: 0, height: 0 },
  // update function (called onMount)
  () => {
    el.addEventListener("resize", () => setSize(getSize()));
    return getSize();
  },
);

createEffect(() => {
  console.log(size.width, size.height);
});
```

## `createDerivedStaticStore`

A derived version of the {@link createStaticStore}. It will use the update function to derive the value of the store. It will only update when the dependencies of the update function change.

### How to use it

It takes the same arguments as `createMemo`, but it returns a reactive object rather than an accessor function.

```ts
const [size, setSize] = createSignal({ width: 0, height: 0 });

el.addEventListener("resize", () => {
  setSize({ width: el.offsetWidth, height: el.offsetHeight });
});

const store = createDerivedStaticStore(size);

createEffect(() => {
  console.log(store.width, store.height);
});
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
