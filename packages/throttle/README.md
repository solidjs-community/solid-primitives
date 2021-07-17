# @solid-primitives/throttle

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

Creates a very efficient throttle function.

## How to use it

```ts
const [trigger, clear] = createThrottle(() => console.log('hi'), 250));
trigger('my-new-value');
console.log(value());
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-throttle-h2wni?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

First version of the throttle primitive.

</details>
