<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=store" alt="Solid Primitives store">
</p>

# @solid-primitives/flux-store

[![size](https://img.shields.io/badge/size-263_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/flux-store)
[![version](https://img.shields.io/npm/v/@solid-primitives/flux-store?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/flux-store)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

A library for creating Solid stores that enforce a one-way data flow through explicit getters for reads and actions for writes.

- [`createFluxStore`](#createfluxstore) — Creates a store instance with explicit getters and actions.
- [`createFluxStoreFactory`](#createfluxstorefactory) — Creates a `FluxStore` encapsulated in a factory function for reusable store instances.
- [`createActions`](#createactions) — Wraps a record of functions so each runs untracked.
- [`createAction`](#createaction) — Wraps a single function so it runs untracked.

## Installation

```bash
npm install @solid-primitives/flux-store
# or
yarn add @solid-primitives/flux-store
# or
pnpm add @solid-primitives/flux-store
```

## `createFluxStore`

Creates a `FluxStore` — a Solid store that separates reads (`getters`) from writes (`actions`).

```tsx repl
import { render } from "@solidjs/web";
import { createFluxStore } from "@solid-primitives/flux-store";

function Demo() {
  const counter = createFluxStore(
    { value: 5 },
    {
      getters: state => ({ count: () => state.value }),
      actions: setState => ({
        increment(by = 1) {
          setState(s => {
            s.value += by;
          });
        },
        reset() {
          setState(s => {
            s.value = 0;
          });
        },
      }),
    },
  );
  return (
    <>
      <button onClick={() => counter.actions.increment()}>+1</button>
      <button onClick={() => counter.actions.increment(5)}>+5</button>
      <button onClick={() => counter.actions.reset()}>Reset</button>
      <p>count: {counter.getters.count()}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### How to use it

`createFluxStore` takes two arguments:

- `initialState` — the initial state object.
- `createMethods` — object with optional `getters` and required `actions` factory functions.
  - `getters(state)` — return a record of functions that read from the reactive store proxy.
  - `actions(setState, state)` — return a record of mutation functions. `setState` uses draft-first mutations: pass a function that mutates the draft object directly.

```ts
import { createFluxStore } from "@solid-primitives/flux-store";

const counterStore = createFluxStore(
  { value: 5 },
  {
    getters: state => ({
      count: () => state.value,
      isNegative: () => state.value < 0,
    }),
    actions: setState => ({
      increment(by = 1) {
        setState(s => {
          s.value += by;
        });
      },
      reset() {
        setState(s => {
          s.value = 0;
        });
      },
    }),
  },
);

counterStore.getters.count(); // => 5
counterStore.actions.increment();
counterStore.getters.count(); // => 6
counterStore.actions.reset();
counterStore.getters.count(); // => 0
```

## `createFluxStoreFactory`

Creates a reusable factory function that produces independent `FluxStore` instances from the same schema, with an optional initial-state override per instance.

```tsx repl
import { render } from "@solidjs/web";
import { createFluxStoreFactory } from "@solid-primitives/flux-store";

const createToggleStore = createFluxStoreFactory(
  { value: false },
  {
    getters: state => ({ isOn: () => state.value }),
    actions: setState => ({
      toggle() {
        setState(s => {
          s.value = !s.value;
        });
      },
    }),
  },
);

function Demo() {
  const a = createToggleStore({ value: true });
  const b = createToggleStore();
  return (
    <>
      <button onClick={() => a.actions.toggle()}>A: {a.getters.isOn() ? "on" : "off"}</button>
      <button onClick={() => b.actions.toggle()}>B: {b.getters.isOn() ? "on" : "off"}</button>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### How to use it

```ts
import { createFluxStoreFactory } from "@solid-primitives/flux-store";

const createToggleStore = createFluxStoreFactory(
  { value: false },
  {
    getters: state => ({
      isOn: () => state.value,
    }),
    actions: setState => ({
      toggle() {
        setState(s => {
          s.value = !s.value;
        });
      },
    }),
  },
);

// Each call creates an isolated store instance
const toggleA = createToggleStore({ value: true });
const toggleB = createToggleStore();

toggleA.getters.isOn(); // => true
toggleB.getters.isOn(); // => false

toggleA.actions.toggle();
toggleA.getters.isOn(); // => false
toggleB.getters.isOn(); // => false (unaffected)
```

The factory accepts an optional override as a plain object or a function:

```ts
const store1 = createToggleStore({ value: true });
const store2 = createToggleStore(defaults => ({ ...defaults, value: true }));
```

## `createActions`

Wraps each function in a record with `createAction` and returns a new object of the same shape. Useful for applying the untracked wrapper to a batch of functions at once.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createActions } from "@solid-primitives/flux-store";

function Demo() {
  const [count, setCount] = createSignal(0);
  const actions = createActions({
    increment: () => setCount(c => c + 1),
    reset: () => setCount(0),
  });
  return (
    <>
      <button onClick={actions.increment}>+1</button>
      <button onClick={actions.reset}>Reset</button>
      <p>count: {count()}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { createActions } from "@solid-primitives/flux-store";

const actions = createActions({
  increment: () => setCount(c => c + 1),
  reset: () => setCount(0),
});
```

## `createAction`

Wraps a single function so its body runs inside `untrack` — reactive reads inside will not register dependencies and writes will not throw inside owned scopes.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createAction } from "@solid-primitives/flux-store";

function Demo() {
  const [count, setCount] = createSignal(0);
  const [step, setStep] = createSignal(1);
  // step() is read untracked inside the action
  const increment = createAction(() => setCount(c => c + step()));
  return (
    <>
      <input type="number" value={1} onInput={e => setStep(Number(e.currentTarget.value) || 0)} />
      <button onClick={() => increment()}>Add step</button>
      <p>count: {count()}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { createAction } from "@solid-primitives/flux-store";

const increment = createAction(() => setCount(c => c + 1));
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
