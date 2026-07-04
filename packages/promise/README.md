<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Promise" alt="Solid Primitives Promise">
</p>

# @solid-primitives/promise

[![docs](https://img.shields.io/badge/-docs%20%26%20demos-blue?style=for-the-badge)](https://primitives.solidjs.community/package/promise)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/promise?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/promise)
[![version](https://img.shields.io/npm/v/@solid-primitives/promise?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/promise)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

A library of reactive primitives and helpers for handling promises.

- [`promiseTimeout`](#promisetimeout) — Creates a promise that resolves _(or rejects)_ after given time.
- [`raceTimeout`](#racetimeout) — Combination of `Promise.race()` and `promiseTimeout`.
- [`until`](#until) — Promised one-time watch for changes. Await a reactive condition.
- [`untilAll`](#untilall) — Like `until`, but waits for **all** conditions to be truthy simultaneously.
- [`untilAny`](#untilany) — Like `until`, but resolves as soon as **any** condition becomes truthy.
- [`retry`](#retry) — Retries an async function on failure, with optional delay and backoff.
- [`changed`](#changed) — A resolver for `until` that resolves when the source changes N times.

## Installation

```bash
npm install @solid-primitives/promise
# or
yarn add @solid-primitives/promise
# or
pnpm add @solid-primitives/promise
```

## `promiseTimeout`

Creates a promise that resolves _(or rejects)_ after given time.

### How to use it

```ts
import { promiseTimeout } from "@solid-primitives/promise";

await promiseTimeout(1000); // resolves after 1 second

try {
  await promiseTimeout(1000, true, "timeout"); // rejects with 'timeout' after 1 second
} catch (e) {
  console.log(e); // 'timeout'
}
```

## `raceTimeout`

Combination of `Promise.race()` and `promiseTimeout`.

### How to use it

```ts
import { raceTimeout } from "@solid-primitives/promise";

await raceTimeout(myPromise, 1000); // resolves after 1 second, or when "myPromise" resolves

try {
  await raceTimeout(myPromise, 1000, true, "timeout"); // rejects with 'timeout' after 1 second, or resolves when "myPromise" resolves
} catch (e) {
  console.log(e); // 'timeout'
}
```

## `until`

Promised one-time watch for changes. Await a reactive condition.

### How to use it

It takes a signal or a reactive condition — which will resolve the promise **if truthy** — as an argument.

Returns a promise that resolves a truthy value of a condition. Or rejects when its root gets disposed.

#### With a custom reactive condition:

No need for `createMemo` — the condition is memoized internally.

```ts
import { until } from "@solid-primitives/promise";

const [count, setCount] = createSignal(0);

await until(() => count() > 5);
```

#### With `raceTimeout`

To limit the maximum time it has for resolving:

```ts
import { until, raceTimeout } from "@solid-primitives/promise";

try {
  const result = await raceTimeout(until(condition), 2000, true, "until was too slow");
  // if until is quicker:
  result; // => truthy condition value
} catch (err) {
  // if timeouts:
  console.log(err); // => "until was too slow"
}
```

#### Manually stopping computation

If you don't want to use `raceTimeout`, there are other ways to stop the reactive computation of `until` if needed.

First, it will stop itself on cleanup.

```ts
// the same goes for components as they are roots too
createRoot(dispose => {

  // disposing root causes the promise to reject,
  // so you need to catch that outcome to prevent errors
  until(condition)
    .then(res => {...})
    .catch(() => {})

  dispose()
})
```

Second, using the `.dispose()` method.

```ts
// until returns a promise with a dispose method on it
const promise = until(condition);

// catch the rejection here too
promise.then().catch();

promise.dispose();
```

## `untilAll`

Resolves when **all** reactive conditions are simultaneously truthy — the reactive equivalent of `Promise.all`.

Resolves with an array of each condition's truthy value, in the same order as the input. Rejects if the parent owner is disposed before all conditions are met. An empty conditions array resolves immediately with `[]`.

### How to use it

```ts
import { untilAll } from "@solid-primitives/promise";

const [auth, setAuth] = createSignal(false);
const [config, setConfig] = createSignal(false);

// resolves with [true, true] when both signals are truthy
await untilAll([auth, config]);
```

#### As an async gate inside a `createMemo`

```ts
const report = createMemo(async () => {
  await untilAll([() => auth.ready(), () => config.loaded()]);
  return generateReport();
});
```

#### With `.dispose()` to stop early

```ts
const p = untilAll([auth, config]);
p.catch(() => {}); // handle the rejection on early disposal

// cancel without waiting
p.dispose();
```

## `untilAny`

Resolves when **any** reactive condition becomes truthy — the reactive equivalent of `Promise.any`.

Resolves with the first truthy value encountered. Rejects if the parent owner is disposed before any condition is met. An empty conditions array produces a promise that never resolves (mirrors `Promise.race([])`).

### How to use it

```ts
import { untilAny } from "@solid-primitives/promise";

const [primary, setPrimary] = createSignal(false);
const [fallback, setFallback] = createSignal(false);

const first = await untilAny([primary, fallback]);
```

#### With custom conditions to identify the winner

```ts
const first = await untilAny([
  () => (authReady() ? "auth" : false),
  () => (guestMode() ? "guest" : false),
]);
// first === "auth" or "guest"
```

## `retry`

Calls an async function up to `times` attempts, retrying on failure. Optionally waits `delay` ms between attempts, or uses a function for dynamic (e.g. exponential) backoff.

### How to use it

```ts
import { retry } from "@solid-primitives/promise";

// basic usage — 3 attempts, no delay
const data = await retry(() => fetch("/api/data").then(r => r.json()));

// exponential backoff
const data = await retry(fetchData, {
  times: 5,
  delay: attempt => 100 * 2 ** attempt,
  shouldRetry: err => err.status !== 401,
});
```

#### Inside a reactive `createMemo`

```ts
const data = createMemo(async () =>
  retry(() => fetch("/api/data").then(r => r.json()), { times: 3, delay: 500 }),
);
```

### Options

| Option        | Type                                    | Default      | Description                                                       |
| ------------- | --------------------------------------- | ------------ | ----------------------------------------------------------------- |
| `times`       | `number`                                | `3`          | Maximum number of attempts                                        |
| `delay`       | `number \| (attempt: number) => number` | `0`          | Ms to wait between attempts. Pass a function for dynamic backoff. |
| `shouldRetry` | `(error: unknown) => boolean`           | `() => true` | Return `false` to stop retrying immediately and rethrow           |

## `changed`

A resolver for `until` that resolves when the source changes a given number of times.

```ts
import { until, changed } from "@solid-primitives/promise";

const [count, setCount] = createSignal(0);

// resolves after count changes 3 times
await until(changed(count, 3));
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

## Inspiration

Original idea for this primitive comes from a [VueUse's function of the same name](https://vueuse.org/shared/until).
