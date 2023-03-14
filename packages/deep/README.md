<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=deep" alt="Solid Primitives deep">
</p>

# @solid-primitives/deep

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/deep?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/deep)
[![version](https://img.shields.io/npm/v/@solid-primitives/deep?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/deep)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A function that allows to trigger effects when deep properties for a store change:

`deepTrack` - Provides a traversed store object.

## Installation

```bash
npm install @solid-primitives/deep
# or
yarn add @solid-primitives/deep
# or
pnpm add @solid-primitives/deep
```

## How to use it

```ts
createEffect(
  on(
    () => deepTrack(sign),
    () => {
      /* function to execute */
    },
  ),
);
```

## Demo

You can use this template for publishing your demo on CodeSandbox: https://codesandbox.io/s/solid-primitives-demo-template-sz95h

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
