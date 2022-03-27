# @solid-primitives/memo

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/memo?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/memo)
[![version](https://img.shields.io/npm/v/@solid-primitives/memo?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/memo)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Collection of custom `createMemo` primitives. They extend it's functionality while keeping the usage similar.

- [`createCurtain`](#createCurtain) - A combined memo of a list of sources, where last updated will be the value.
- [`createWritableMemo`](#createWritableMemo) - Solid's `createMemo` which value can be overwritten by a setter.
- [`createLazyMemo`](#createLazyMemo) - Lazily evaluated memo. Will run the calculation only if is being listened to.
- [`createAsyncMemo`](#createAsyncMemo) - Memo that allows for asynchronous calculations.
- [`createDebouncedMemo`](#createDebouncedMemo) - Memo which returned signal is debounced.
- [`createThrottledMemo`](#createThrottledMemo) - Memo which returned signal is throttled.
- [`createPureReaction`](#createPureReaction) - A `createReaction` that runs before render _(non-batching)_.
- [`createMemoCache`](#createMemoCache) - Custom, lazily-evaluated, memo, with caching based on keys.

## Installation

```bash
npm install @solid-primitives/memo
# or
yarn add @solid-primitives/memo
```

## `createCurtain`

A combined memo of multiple sources, last updated source will be the value of the returned signal.

### How to use it

`createCurtain` takes three arguments:

- `sources` - list of reactive calculations/signals/memos
- `value` - initial value of returned signal
- `options` - signal options

And returns a signal with value of the last change

```ts
import { createCurtain } from "@solid-primitives/memo";

const [count, setCount] = createSignal(1);
const [x, setX] = createSignal(2);
const number = createMemo(() => otherValue() * 2);
const lastUpdated = createCurtain([count, number, () => x() / 3]);
lastUpdated(); // => undefined
setCount(4);
lastUpdated(); // => 4
setX(9);
lastUpdated(); // => 3
```

## `createWritableMemo`

Solid's `createMemo` which value can be overwritten by a setter.

### How to use it

`createWritableMemo` takes the same arguments as Solid's `createMemo`:

- `calc` - callback that calculates the value
- `value` - initial value (for calcultion)
- `options` - give a name to the reactive computation, or change `equals` method.

And returns a signal with value of the last change, set by a setter or a memo calculation.

```ts
import { createWritableMemo } from "@solid-primitives/memo";

const [count, setCount] = createSignal(1);
const [result, setResult] = createWritableMemo(() => count() * 2);
result(); // => 2
setResult(5); // overwrites calculation result
result(); // => 10
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
const memo = createLazyMemo(prev => count() + prev, 123);
memo(); // T: number
```

###### See [the tests](https://github.com/solidjs-community/solid-primitives/blob/main/packages/memo/test/lazy.test.ts) for better usage reference.

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

## `createPureReaction`

Solid's [`createReaction`](#https://www.solidjs.com/docs/latest/api#createreaction) that is based on pure computation _(runs before render, and is non-batching)_

### How to use it

It's usage exactly matches the original. The only difference is in when the callback is being executed, the normal createReaction runs it after render, similar to how effects work, while the createPureReaction is more like createComputed.

```ts
import { createPureReaction } from "@solid-primitives/memo"

const [count, setCount] = createSignal(0);
const track = createPureReaction(() => {...});
track(count);
setCount(1); // triggers callback

// sources need to be re-tracked every time
setCount(2); // doesn't trigger callback
```

### Definition

```ts
function createPureReaction(onInvalidate: Fn, options?: EffectOptions): (tracking: Fn) => void;
```

## `createMemoCache`

Custom, lazily-evaluated, cached memo. The caching is based on a `key`, it has to be declared up-front as a reactive source, or passed to the signal access function.

### how to use it

It takes params:

- `key` a reactive source, that will serve as cache key (later value access for the same key will be taken from cache instead of recalculated)
- `calc` calculation function returning value to cache. the function is **tracking** - will recalculate when the accessed signals change.
- `options` set maximum **size** of the cache, or memo options.

Returns a signal access function.

#### Import

```ts
import { createMemoCache } from "@solid-primitives/memo";
```

#### Setting the key up-front as a reactive source

```ts
const [count, setCount] = createSignal(1);
const double = createMemoCache(count, n => n * 2);
// access value:
double();
```

#### Provide the key by passing it to the access function

let's accessing different keys in different places

```ts
const [count, setCount] = createSignal(1);
const double = createMemoCache((n: number) => n * 2);
// access value with key:
double(count());
```

#### Calculation function is reactive

will recalculate when the accessed signals change.

```ts
// changing number creates new entry in cache
const [number, setNumber] = createSignal(1);
// changing divisor will force cache to be recalculated
const [divisor, setDivisor] = createSignal(1);

// calculation subscribes to divisor signal
const result = createMemoCache(number, n / divisor());
```

### Definition

```ts
function createMemoCache<Key, Value>(
  key: Accessor<Key>,
  calc: CacheCalculation<Key, Value>,
  options?: CacheOptions<Value>
): Accessor<Value>;
function createMemoCache<Key, Value>(
  calc: CacheCalculation<Key, Value>,
  options?: CacheOptions<Value>
): CacheKeyAccessor<Key, Value>;

type CacheCalculation<Key, Value> = (key: Key, prev: Value | undefined) => Value;
type CacheKeyAccessor<Key, Value> = (key: Key) => Value;
type CacheOptions<Value> = MemoOptions<Value> & { size?: number };
```

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-1 primitive.

0.0.200

Add `createWritableMemo`. rename `createCache` to `createMemoCache`.

0.0.300

Add `createCurtain`. refactor `createWritableMemo`.

</details>
