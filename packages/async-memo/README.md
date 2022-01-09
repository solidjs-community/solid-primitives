# @solid-primitives/async-memo

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/async-memo?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/async-memo)
[![version](https://img.shields.io/npm/v/@solid-primitives/async-memo?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/async-memo)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Solid's `createMemo` that allows for asynchronous calculations.

## Installation

```bash
npm install @solid-primitives/async-memo
# or
yarn add @solid-primitives/async-memo
```

## How to use it

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

**Please don't use it instead of createResource for fetching data.**

```ts
// createResource also can reactively refetch once source changes
const [data] = createResource(signal, value => {...})
```

## Demo

Demo uses fetching because it is the simplest example to make

https://codesandbox.io/s/solid-primitives-async-memo-fetch-demo-htne6?file=/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-0 primitive.

</details>
