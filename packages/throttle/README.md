# @solid-primitives/throttle

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/throttle?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/throttle)
[![size](https://img.shields.io/npm/v/@solid-primitives/throttle?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/throttle)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Creates a throttled function that invokes at most once per specified time.

When used in an reactive context (effect or component), any throttled function pending to execute will be automatically canceled when the context is cleaned up.

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

1.0.8

Adding CJS support to package.

1.1.0

Updated to Solid 1.3

1.1.3

General clean-up and improvements by Joe Pea (trusktr)

</details>
