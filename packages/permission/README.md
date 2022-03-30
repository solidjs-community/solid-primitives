<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Permission" alt="Solid Primitives">
</p>

# @solid-primitives/permission

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/permission?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/permission)
[![size](https://img.shields.io/npm/v/@solid-primitives/permission?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/permission)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Creates a primitive to query user permissions.

## Installation

```
npm install @solid-primitives/permission
# or
yarn add @solid-primitives/permission
```

## How to use it

```ts
const state: "unknown" | PermissionState = createPermission(descriptor: PermissionDescription | PermissionName);
```

## Demo

TODO

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release adapted from https://github.com/microcipcip/vue-use-kit/blob/master/src/functions/useFetch/useFetch.ts.

1.0.2

Minor clean-up and added CJS support.

1.0.3

Added server entry and updated to latest Solid.

</details>
