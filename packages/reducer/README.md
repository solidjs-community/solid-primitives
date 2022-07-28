# @solid-primitives/reducer

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/reducer?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/reducer)
[![version](https://img.shields.io/npm/v/@solid-primitives/reducer?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/reducer)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Provides a createReducer primitive for updating state in a predictable way.
SolidJS equivalent of React's [useReducer](https://reactjs.org/docs/hooks-reference.html#usereducer).

## Installation

```bash
npm install @solid-primitives/reducer
# or
yarn add @solid-primitives/reducer
```

## When to use it

`createReducer` is useful for:

1. DRY the code of the `set`s of a signal
2. Ensure the signal is always in a valid state
3. Make it easier to understand for what a signal is used

## How to use it

```ts
const [accessor, dispatch] = createReducer<State>(
  dispatcher: (state: State, ...args) => State,
  initialState: State
);
```

`dispatcher` is the reducer, it's 1st parameter always is the current state of the reducer and it returns the new state of the reducer.

`accessor` can be used as you use a normal signal: `accessor()`. It contains the state of the reducer.

`dispatch` is the action of the reducer, it is a sort of `setSignal` that does NOT receive the new state, but instructions to create it from the current state.

For example:

```tsx
function Counter() {
  const [count, double] = createReducer(c => c * 2, 1);

  return <button onClick={double}>{count()}</button>;
}
```

The reducer also can receive other arguments:

```tsx
const dispatcher = (c: number, type: "double" | "increment") => {
  if (type == "double") {
    return c * 2;
  } else {
    return c + 1;
  }
};

function Counter() {
  const [count, handleClick] = createReducer(dispatcher, 1);

  return (
    <div>
      <span>{count()}</span>

      <button onClick={() => handleClick("double")}>Double</button>
      <button onClick={() => handleClick("increment")}>Increment</button>
    </div>
  );
}
```

React allows a 3rd argument:

```ts
const fib = (n: number) => (n < 2 ? n : fib(n - 1) + fib(n - 2));
const nextFib = (n: number) => Math.round((n * (1 + sqrt(5))) / 2);

const [fibonacci, nextFibonacci] = useReducer(nextFib, 1, fib);
```

You need to convert that to the following format:

```ts
const [fibonacci, nextFibonacci] = createReducer(nextFib, fib(1));
```

## Demo

https://codesandbox.io/s/solid-primitives-reducer-demo-7nrfs2?file=/index.tsx

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
