# @solid-primitives/context

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/context?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/context)
[![version](https://img.shields.io/npm/v/@solid-primitives/context?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/context)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Primitives simplifying or extending the SolidJS Context API.

- **[`createContextProvider`](#createContextProvider)** - Create the context provider component & useContext function with types inferred from the factory function.

## Installation

```bash
npm install @solid-primitives/context
# or
yarn add @solid-primitives/context
```

## `createContextProvider`

Create the context provider component & useContext function with types inferred from the factory function.

### How To use it

#### Import

```ts
import { createContextProvider } from "@solid-primitives/context";
```

#### Creating the context provider and use-primitive

Types of the context are inferred from it's factory function. Factory function will run when the provider component in executed. It takes the provider component `props` as it's argument, and what it returns will be available in the contexts for all the underlying components.

```ts
const [CounterProvider, useCounter] = createContextProvider((props: { initial: number }) => {
  const [count, setCount] = createSignal(props.initial);
  const increment = () => setCount(count() + 1);
  return { count, increment };
});
```

#### Place the Provider

The provider component takes `props` declared as arguments of the factory functions.

```tsx
// Provide the context
<CounterProvider initial={1}>
  <App />
</CounterProvider>
```

#### Use context in children components

The context will by default be `T | undefined`.

```ts
// get the context
const ctx = useCounter();
ctx?.count(); // => 1
```

Or provide an fallback to be able to destructure safely.

```ts
const { count } = useCounter() ?? { count: () => 0 };
```

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial realease of the context package.

</details>
