<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Context" alt="Solid Primitives Context">
</p>

# @solid-primitives/context

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/context?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/context)
[![version](https://img.shields.io/npm/v/@solid-primitives/context?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/context)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives simplifying the creation and use of SolidJS Context API.

- [`createContextProvider`](#createcontextprovider) - Create the Context Provider component and useContext function with types inferred from the factory function.
- [`createLayeredContext`](#createlayeredcontext) - Like `createContextProvider`, but each provider extends the parent context value rather than replacing it.
- [`MultiProvider`](#multiprovider) - A component that allows you to provide multiple contexts at once.

## Installation

```bash
npm install @solid-primitives/context
# or
pnpm add @solid-primitives/context
# or
yarn add @solid-primitives/context
```

Requires `solid-js@^2.0.0-beta.13` and `@solidjs/web@^2.0.0-beta.13`.

## `createContextProvider`

Create the Context Provider component and useContext function with types inferred from the factory function.

### How to use it

Given a factory function, `createContextProvider` creates a SolidJS Context and returns both a Provider component for setting the context, and a useContext helper for getting the context. The factory function gets called when the provider component gets executed; all `props` of the provider component get passed into the factory function, and what it returns will be available in the contexts for all the underlying components. The types of the provider props and context are inferred from the factory function.

```tsx
import { createContextProvider } from "@solid-primitives/context";

const [CounterProvider, useCounter] = createContextProvider((props: { initial: number }) => {
  const [count, setCount] = createSignal(props.initial);
  const increment = () => setCount(count() + 1);
  return { count, increment };
});

// Provide the context
<CounterProvider initial={1}>
  <App />
</CounterProvider>;

// Use the context in a child component
const ctx = useCounter();
ctx; // T: { count: () => number; increment: () => void; } | undefined
```

### Providing context fallback

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
    increment: () => {},
  },
);

// then when using the context:
const { count } = useCounter();
```

### Debug name

An optional `name` can be passed as part of the third argument. It labels the context's Symbol for Solid DevTools and improves `ContextNotFoundError` stack traces (dev mode only).

```ts
const [ThemeProvider, useTheme] = createContextProvider(
  () => createTheme(),
  defaultTheme,
  { name: "Theme" },
);
```

### Demo

https://codesandbox.io/s/solid-primitives-context-demo-oqyie2?file=/index.tsx

## `createLayeredContext`

Like `createContextProvider`, but each provider in the tree *extends* the parent context value rather than replacing it entirely. The factory function receives the nearest parent's context value as its second argument.

This is useful for incremental overrides such as themes, permissions layers, or i18n patches where a child provider should inherit what it does not explicitly change.

```tsx
import { createLayeredContext } from "@solid-primitives/context";

const [ThemeProvider, useTheme] = createLayeredContext(
  (props: { primary?: string; secondary?: string }, parent) => ({
    ...parent,
    primary: props.primary ?? parent.primary,
    secondary: props.secondary ?? parent.secondary,
  }),
  { primary: "blue", secondary: "gray" }, // base defaults
);

// Root: { primary: "red", secondary: "gray" }
<ThemeProvider primary="red">
  {/* Nested: { primary: "green", secondary: "gray" } — secondary inherited */}
  <ThemeProvider primary="green">
    <App />
  </ThemeProvider>
</ThemeProvider>;
```

`createLayeredContext` always requires a `defaults` value (the base used when no parent provider wraps the component). The hook return type is always `T` (never `undefined`).

## `MultiProvider`

A component that allows you to provide multiple contexts at once.

It will work exactly like nesting multiple providers as separate components, but it will save you from the nesting.

### How to use it

`MultiProvider` takes only a single `values` with a key-value pair of the context and the value to provide.

> **Note**
> Values list is evaluated in order, so the context values will be provided in the same way as if you were nesting the providers.

```tsx
import { MultiProvider } from "@solid-primitives/context";

// before
<FooContext value={"foo"}>
  <BarContext value={"bar"}>
    <BazContext value={"baz"}>
      <MyCustomProviderComponent value={"hello-world"}>
        <BoundContextProvider>
          <App />
        </BoundContextProvider>
      </MyCustomProviderComponent>
    </BazContext>
  </BarContext>
</FooContext>;

// after
<MultiProvider
  values={[
    [FooContext, "foo"],
    [BarContext, "bar"],
    [BazContext, "baz"],
    // you can also provide a component, the value will be passed to a `value` prop
    [MyCustomProviderComponent, "hello-world"],
    // if you have a provider that doesn't accept a `value` prop, you can just pass a function
    BoundContextProvider,
  ]}
>
  <App />
</MultiProvider>;
```

> **Warning**
> Components and values passed to `MultiProvider` will be evaluated only once, so make sure that the structure is static. If it isn't, please use nested provider components instead.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
