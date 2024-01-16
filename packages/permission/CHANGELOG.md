# @solid-primitives/permission

## 1.2.5

### Patch Changes

- d23dd74: Add type exports for cjs

## 1.2.4

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 1.2.3

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 1.2.2

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 1.2.1

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 1.2.0

### Minor Changes

- a9adb30f: fix in firefox

## 1.1.1

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 1.1.0

0.0.100

Initial release adapted from https://github.com/microcipcip/vue-use-kit/blob/master/src/functions/useFetch/useFetch.ts.

1.0.2

Minor clean-up and added CJS support.

1.0.3

Added server entry and updated to latest Solid.
