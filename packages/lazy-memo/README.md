# @solid-primitives/lazy-memo

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/lazy-memo?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/lazy-memo)
[![version](https://img.shields.io/npm/v/@solid-primitives/lazy-memo?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/lazy-memo)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/davedbase/solid-primitives#contribution-process)

**`createLazyMemo`**: Lazily evaluated `createMemo`. Will run the calculation only if is being listened to.

## Installation

```bash
npm install @solid-primitives/lazy-memo
# or
yarn add @solid-primitives/lazy-memo
```

## How to use it

It's usage is almost the same as Solid's `createMemo`. Similarly it should be placed inside a reactive root — component or createRoot.

```ts
// use like a createMemo
const double = createLazyMemo(() => count() * 2);
double(); // T: number | undefined
```

Because it executes lazily, the calculation won't run if nothing is listening to it, that also includes the initial run by default. It causes the signal to might return `undefined` when accessed for the first time.

```ts
// use the options to enable initial run
const double = createLazyMemo(() => count() * 2, { init: true });
double(); // T: number

// or set the initial value
const double = createLazyMemo(() => count() * 2, { value: 0 });
double(); // T: number
```

###### See [the tests](https://github.com/davedbase/solid-primitives/blob/main/packages/lazy-memo/test/index.test.ts) for better usage reference.

## Types

```ts
// both init run was enabled and initial value provided
export function createLazyMemo<T>(
  calc: (prev: T) => T,
  options: EffectOptions & { value: T; init: true }
): Accessor<T>;
// initial value was provided
export function createLazyMemo<T>(
  calc: (prev: T) => T,
  options: LazyMemoOptions<T> & { value: T }
): Accessor<T>;
// calculation will run initially
export function createLazyMemo<T>(
  calc: (prev: T | undefined) => T,
  options: LazyMemoOptions<T> & { init: true }
): Accessor<T>;
// no initial value was provided
export function createLazyMemo<T>(
  calc: (prev: T | undefined) => T,
  options?: LazyMemoOptions<T>
): Accessor<T | undefined>;

export type LazyMemoOptions<T> = EffectOptions & {
  value?: T;
  init?: boolean;
};
```

## Demo

https://codesandbox.io/s/solid-primitives-lazy-memo-demo-3w0oz?file=/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-1 primitive.

</details>
