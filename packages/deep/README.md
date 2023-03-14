<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Deep" alt="Solid Primitives Deep">
</p>

# @solid-primitives/deep

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/deep?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/deep)
[![version](https://img.shields.io/npm/v/@solid-primitives/deep?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/deep)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

- [`deepTrack`](#deepTrack) - A function that allows to trigger effects when deep properties for a store change

## Installation

```bash
npm install @solid-primitives/deep
# or
yarn add @solid-primitives/deep
# or
pnpm add @solid-primitives/deep
```

## How to use it

You can explicitly pass dependencies to effect functions like `on` and `defer` to deeply track its dependencies.

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

Or since this has a composable design, you can create _derivative_ functions and use them similar to derivative signals.

```ts
const deeplyTrackedStore = () => deepTrack(sign);
createEffect(() => {
  console.log("Store is: ", deeplyTrackedStore());
  //                        ^ this causes a re-execution of the effect on deep changes of properties
});
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
