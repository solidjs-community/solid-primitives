# @solid-primitives/range

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/range?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/range)
[![version](https://img.shields.io/npm/v/@solid-primitives/range?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/range)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/davedbase/solid-primitives#contribution-process)

A sample primitive that is made up for templating with the following options:

`createPrimitiveTemplate` - Provides a getter and setter for the primitive.

## Installation

```bash
npm install @solid-primitives/range
# or
yarn add @solid-primitives/range
```

## `mapRange`

```ts
const mapped = mapRange(10, index => {
   const [value, setValue] = createSignal(index);
   createEffect(() => {...})
   return value
})
```

#### Definition

```ts
function mapRange<T>(
  length: Accessor<number>,
  mapFn: (i: number) => T,
  options?: { fallback?: Accessor<T> }
): Accessor<T[]>;
```

## Demo

You can use this template for publishing your demo on CodeSandbox: https://codesandbox.io/s/solid-primitives-demo-template-sz95h

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-0 primitive.

</details>
