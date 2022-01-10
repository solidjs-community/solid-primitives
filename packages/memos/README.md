# @solid-primitives/memos

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/memos?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/memos)
[![version](https://img.shields.io/npm/v/@solid-primitives/memos?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/memos)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Collection of custom `createMemo` primitives. They extend it's functionality while keeping the usage similar.

- [`createLazyMemo`](#createLazyMemo) - Lazily evaluated memo. Will run the calculation only if is being listened to.
- [`createAsyncMemo`](#createAsyncMemo) - Memo that allows for asynchronous calculations.

## Installation

```bash
npm install @solid-primitives/memos
# or
yarn add @solid-primitives/memos
```

## `createLazyMemo`

Lazily evaluated `createMemo`. Will run the calculation only if is being listened to.

### How to use it

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

###### See [the tests](https://github.com/davedbase/solid-primitives/blob/main/packages/memos/test/lazy.test.ts) for better usage reference.

### Demo

https://codesandbox.io/s/solid-primitives-memos-demo-3w0oz?file=/index.tsx

## `createAsyncMemo`

Solid's `createMemo` that allows for asynchronous calculations.

### How to use it

It's usage is almost the same as Solid's `createMemo`. Similarly it should be placed inside a reactive root — component or createRoot.

The function argument can return a promise. Promises will be handled with preserving the order of execution, that means if a promise would take more time to execute it won't overwrite thouse that start after it but finish quicker.

```ts
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

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-1 primitive.

</details>
