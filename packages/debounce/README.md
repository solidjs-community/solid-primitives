# @solid-primitives/debounce

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/debounce?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/debounce)
[![size](https://img.shields.io/npm/v/@solid-primitives/debounce?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/debounce)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fstage-badges%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Creates a helpful debounce function.

## Installation

```
npm install @solid-primitives/debounce
# or
yarn add @solid-primitives/debounce
```

## How to use it

```ts
const [fn, clear] = createDebounce(() => console.log('hi'), 250));
fn('my-new-value');
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-debounce-ng9bs?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

Initial commit and publish of debounce primitive.

1.0.1

Improved types, minor clean-up and added tests.

1.0.2

Changed any to unknown type and applied patch from high1.

1.0.5

Adding CJS support to package.

1.0.8

Cleaned up documentation

</details>
