---
Name: throttle
Package: "@solid-primitives/throttle"
Primitives: createThrottle
---

# @solid-primitives/throttle

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/throttle)](https://bundlephobia.com/package/@solid-primitives/throttle)
[![size](https://img.shields.io/npm/v/@solid-primitives/throttle)](https://www.npmjs.com/package/@solid-primitives/throttle)

Creates a throttled function that invokes at most once per specified time.

## How to use it

```ts
const [trigger, clear] = createThrottle((value) => console.log(value), 250));
trigger('my-new-value');
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-throttle-h2wni?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

First version of the throttle primitive.

1.0.3

Cleaned up return types and documentation.

</details>
