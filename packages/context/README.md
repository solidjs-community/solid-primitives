# @solid-primitives/context

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/context?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/context)
[![version](https://img.shields.io/npm/v/@solid-primitives/context?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/context)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Primitives simplifying the creation and use of SolidJS Context Providers.

## Installation

```bash
npm install @solid-primitives/context
# or
yarn add @solid-primitives/context
```

## `createContextProvider`

Create the Context Provider component and useContext function with types inferred from the factory function.

#### Import

```ts
import { createContextProvider } from "@solid-primitives/context";
```

#### Creating the Context Provider

Given a factory function, `createContextProvider` creates a SolidJS Context and returns both a Provider component for setting the context, and a useContext helper for getting the context. The factory function gets called when the provider component gets executed; all `props` of the provider component get passed into the factory function, and what it returns will be available in the contexts for all the underlying components. The types of the provider props and context are inferred from the factory function.

```ts
const [CounterProvider, useCounter] = createContextProvider((props: { initial: number }) => {
  const [count, setCount] = createSignal(props.initial);
  const increment = () => setCount(count() + 1);
  return { count, increment };
});
```

#### Set Context using the Provider

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

#### Providing context fallback

The `createContextProvider` primitive takes a second, optional argument for providing context defaults for when the context wouldn't be provided higher in the component tree.
Providing a fallback also removes `undefined` from `T | undefined` return type of the `useContext` function.

```ts
const [CounterProvider, useCounter] = createContextProvider(
  () => {
    const [count, setCount] = createSignal(0);
    const increment = () => setCount(count() + 1);
    return { count, increment };
  },
  {
    count: () => 0,
    increment: () => {}
  }
);

// then when using the context:
const { count } = useCounter();
```

Definite context types without defaults:

```ts
const useDefiniteCounter = () => useCounter()!;
```

#### Type Definition

```ts
function createContextProvider<T, P extends ContextProviderProps>(
  factoryFn: (props: P) => T,
  defaults: T
): [provider: ContextProvider<P>, useContext: () => T];
function createContextProvider<T, P extends ContextProviderProps>(
  factoryFn: (props: P) => T
): [provider: ContextProvider<P>, useContext: () => T | undefined];

type ContextProviderProps = {
  children?: JSX.Element;
} & Record<string, unknown>;
type ContextProvider<T extends ContextProviderProps> = (
  props: { children: JSX.Element } & T
) => JSX.Element;
```

## Demo

https://codesandbox.io/s/solid-primitives-context-demo-oqyie2?file=/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release of the context package.

</details>
