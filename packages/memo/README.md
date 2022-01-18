# @solid-primitives/memo

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/memo?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/memo)
[![version](https://img.shields.io/npm/v/@solid-primitives/memo?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/memo)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Collection of custom `createMemo` primitives. They extend it's functionality while keeping the usage similar.

- [`createLazyMemo`](#createLazyMemo) - Lazily evaluated memo. Will run the calculation only if is being listened to.
- [`createAsyncMemo`](#createAsyncMemo) - Memo that allows for asynchronous calculations.
- [`createDebouncedMemo`](#createDebouncedMemo) - Memo which returned signal is debounced.
- [`createThrottledMemo`](#createThrottledMemo) - Memo which returned signal is throttled.

## Installation

```bash
npm install @solid-primitives/memo
# or
yarn add @solid-primitives/memo
```

## `createLazyMemo`

Lazily evaluated `createMemo`. Will run the calculation only if is being listened to.

### How to use it

It's usage is almost the same as Solid's `createMemo`. Similarly it should be placed inside a reactive root — component or createRoot.

```ts
import { createLazyMemo } from "@solid-primitives/memo";

// use like a createMemo
const double = createLazyMemo(() => count() * 2);
double(); // T: number
```

Set the initial value, or type of the previous value in calculation function will be `T | undefined`.

```ts
// set the initial value
const memo = createLazyMemo(prev => count() + prev, { value: 0 });
memo(); // T: number
```

###### See [the tests](https://github.com/davedbase/solid-primitives/blob/main/packages/memo/test/lazy.test.ts) for better usage reference.

### Demo

https://codesandbox.io/s/solid-primitives-memo-demo-3w0oz?file=/index.tsx

## `createAsyncMemo`

Solid's `createMemo` that allows for asynchronous calculations.

### How to use it

It's usage is almost the same as Solid's `createMemo`. Similarly it should be placed inside a reactive root — component or createRoot.

The function argument can return a promise. Promises will be handled with preserving the order of execution, that means if a promise would take more time to execute it won't overwrite thouse that start after it but finish quicker.

```ts
import { createAsyncMemo } from "@solid-primitives/memo";

const memo = createAsyncMemo(
  async prev => {
    const value = await myAsyncFunc(signal());
    return value.data;
  },
  { value: "initial value" }
);
// initial value can be set to prevent returned signal from being undefined
```

**calculation will track reactive reads synchronously — stops tracking after first `await`**

```ts
const memo = createAsyncMemo(async prev => {
  // signal() will be tracked
  const value = await myAsyncFunc(signal());
  // otherSignal() is after await so it won't be tracked
  const data = otherSignal() + value;
  return value;
});
```

### Demo

Demo uses fetching because it is the simplest example to make, but **please don't use it instead of createResource for fetching data.**

https://codesandbox.io/s/solid-primitives-async-memo-fetch-demo-htne6?file=/index.tsx

```ts
// createResource also can reactively refetch once source changes
const [data] = createResource(signal, value => {...})
```

## `createDebouncedMemo`

Solid's `createMemo` which returned signal is debounced.

### How to use it

```ts
import { createDebouncedMemo } from "@solid-primitives/memo";

// base usage:
const double = createDebouncedMemo(prev => count() * 2, 200);

// with initial value:
const double = createDebouncedMemo(prev => count() * 2, 200, { value: 0 });
```

Notes:

1. the callback is not perfectly debounced, it will be fired twice for each debounce duration, instead of once. _(this shouldn't really matter, because only a pure calculation should be passed as callback)_
2. the callback is run initially to kickoff tracking and set the signal's value.

## `createThrottledMemo`

Solid's `createMemo` which returned signal is throttled.

### How to use it

```ts
import { createThrottledMemo } from "@solid-primitives/memo";

// base usage:
const double = createThrottledMemo(prev => count() * 2, 200);

// with initial value:
const double = createThrottledMemo(prev => count() * 2, 200, { value: 0 });
```

Note: the callback is run initially to kickoff tracking and set the signal's value.

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-1 primitive.

</details>
