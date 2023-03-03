<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=store" alt="Solid Primitives store">
</p>

# @solid-primitives/flux-store

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/flux-store?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/flux-store)
[![version](https://img.shields.io/npm/v/@solid-primitives/flux-store?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/flux-store)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A primitive to help with the creation, access and mutation of a state store via SolidJS `Provider`, `Context` and `Store`:

- [`createStoreFactory`](#createStoreFactory) — Returns a `Provider` and functions to access and mutate a Context derived state store.

## Installation

```bash
npm install @solid-primitives/flux-store
# or
yarn add @solid-primitives/flux-store
# or
pnpm add @solid-primitives/flux-store
```

## `createStoreFactory`

##### Returns `[Provider, {useStore, produce, unwrapped, ...extras}]`

- **`Provider` -** the `Provider` control flow enabling access to the Context derived state store.
- **`useStore` -** a function returning the current state and optional access/mutation functions, similar to manually using `useContext(Context)`.
- **`produce` -** a modified function derived from the standard **SolidJS** `produce` function, pre-wrapped with `setState`, simplifying use.
- **`unwrapped` -** a function returning the results of the standard **SolidJS** `unwrap` function that's automatically been passed the proxy store object.

##### Extras

- **`store` -** reactive store that can be read through a proxy object and written with a setter function.
  - `const [state, setState] = createStore(initialState);`
  - **Note:** This is the same object returned if manually passing an initial state to the **SolidJS** `createStore` function.
- For convenience, the `state` and `setState` objects are also returned alongside `useStore`, `produce`, `unwrapped` and `store`.
  - **`state` -** a readonly proxy object typically returned in the first position of the **SolidJS** `createStore` function.
  - **`setState` -** a setter function typically returned in the second position of the **SolidJS** `createStore` function.

#### How to use it

##### Create Store

###### stores/counter-store.ts

```ts
// `counter-store.ts`
import { createStoreFactory } from "@solid-primitives/flux-store";
const [CounterProvider, { useStore: useCounterStore }] = createStoreFactory(
  {
    value: 5,
  },
  (state, setState) => ({
    count: () => state.value,
    increment: () => setState(val => ({ value: val.value + 1 })),
    reset: () => setState({ value: 0 }),
  }),
);
export { CounterProvider, useCounterStore };
```

##### Add Provider

###### App.tsx

```tsx
// `App.tsx`
import { CounterProvider } from "./stores/counter-store.ts";

// Wrap the app in the store's Provider
<CounterProvider>
  <App />
</CounterProvider>;
```

##### Consume Store

###### pages/Example.tsx

```tsx
// `Example.tsx`
import { useCounterStore } from "../stores/counter-store.ts";

const [counterState, { count, increment, reset }] = useCounterStore();
count(); // => 5
increment();
count(); // => 6
reset(); // => 0
```

## Demo

View Demo:
https://vu5z5u-3000.preview.csb.app/

Open Demo Editor:
https://codesandbox.io/p/sandbox/solid-primitives-store-web-demo-vu5z5u

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
