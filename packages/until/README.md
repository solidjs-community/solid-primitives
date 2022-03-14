# @solid-primitives/until

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/until?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/until)
[![size](https://img.shields.io/npm/v/@solid-primitives/until?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/until)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Promised one-time watch for changes. Await a reactive condition.

## Installation

```bash
npm install @solid-primitives/until
# or
yarn add @solid-primitives/until
```

## How to use it

It takes a signal or a reactive condition — which will resolve the promise **if truthy** — as an argument.

Returns a promise that resolves a truthy value of a condition. Or rejects when it's root get's disposed.

#### Import

```ts
import { until } from "@solid-primitives/until";
```

#### With a custom reactive condition:

no need for createMemo, it's memoized internally

```ts
const [count, setCount] = createSignal(0);

await until(() => count() > 5);
```

#### With `createResource`

Wait for async data to be ready. Or just any signal as a source, that can be truthy/falsy.

```ts
const [data] = createResource(fetcher);

const result = await until(data);
```

Actually, since it return a promise, it also can be used as a **source** for `createResource`.

```ts
const [state, setState] = createSignal(null);

const [data] = createResource(() => until(state));

const result = await until(data);
```

#### With `raceTimeout`

To limit the maximum time it has for resolving

```ts
import { raceTimeout } from "@solid-primitives/utils";
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

First, it will stop itself "onCleanup".

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
// until returns a promise with a dispose method in it
const promise = until(condition);

// you need to catch the rejection here too
promise.then().catch();

promise.dispose();
```

## Demo

`until` + `createResource` demo: https://codesandbox.io/s/until-resource-demo-sfs7c?file=/src/index.tsx

`until` as `createResource` fetcher: https://codesandbox.io/s/until-as-resource-fetcher-6sl0e?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-1 primitive.

0.0.150

Upgraded to Solid 1.3

</details>

## Inspiration

Original idea for this primitive comes from a [VueUse's function of the same name](https://vueuse.org/shared/until).
