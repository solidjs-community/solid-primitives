# @solid-primitives/throttle

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

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

1.0.1

Cleaned up return types and documentation.

</details>
