# @solid-primitives/tween

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

Creates a helpful debounce function.

## How to use it

```ts
const [trigger, clear] = createDebounce(() => console.log('hi'), 250));
trigger('my-new-value');
console.log(value());
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-debounce-ng9bs?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

Initial commit and publish of debounce primitive.

</details>
