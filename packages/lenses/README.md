<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=lenses" alt="Solid Primitives lenses">
</p>

# @solid-primitives/lenses

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/lenses?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/lenses)
[![version](https://img.shields.io/npm/v/@solid-primitives/lenses?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/lenses)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A sample primitive that is made up for templating with the following options:

`createLens` - Given a path within a Store object, return a derived or "focused"
getter and setter pair.

`createFocusedGetter` - The first half of the lens tuple; a derived signal
using path syntax on an object.

`createFocusedSetter` - The second half of the lens tuple; a Setter
for a specific path within a Store.

## TODO

- [X] Type-safe path syntax
- [X] Handle arrays
- [X] Export separate primitives for Getter and Setter
  - [X] `createFocusedGetter`
  - [X] `createFocusedSetter`
- [ ] Handle multiple array index syntax
- [ ] Test all variations of path syntax
- [ ] Test edge case: repeated filter functions in array path
  - This may differ from `SetStoreFunction`
- [ ] Check and/or replicate official SolidJS Store test cases for parity

## Installation

```bash
npm install @solid-primitives/lenses
# or
yarn add @solid-primitives/lenses
# or
pnpm add @solid-primitives/lenses
```

## How to use it

```ts
const [value, setValue] = createPrimitiveTemplate(false);
```

## Demo

You can use this template for publishing your demo on CodeSandbox: <https://codesandbox.io/s/solid-primitives-demo-template-sz95h>

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
