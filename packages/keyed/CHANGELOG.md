# @solid-primitives/keyed

## 1.5.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 1.4.0

### Minor Changes

- e82cb70: Add `SetValues` control flow component.

## 1.3.0

### Minor Changes

- cf11535: Add `MapEntries` control flow component.

## 1.2.3

### Patch Changes

- 9749071: Makes Entries take key's type as a generic

## 1.2.2

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 1.2.1

### Patch Changes

- d23dd74: Add type exports for cjs

## 1.2.0

### Minor Changes

- 1edee005: Expose index of the item in the `keyFn` callback

## 1.1.10

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 1.1.9

### Patch Changes

- 06ab3e0c: Prepare component types for changes to JSX types in solid-js@1.7.0

## 1.1.8

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 1.1.7

### Patch Changes

- 651af5ce: Cleanup

## 1.1.6

### Patch Changes

- c2866ea6: Update utils package

## 1.1.5

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 1.1.4

### Patch Changes

- 9ebe4502: Update `<Entries>` to use mapArray, instead of keyArray

## 1.1.3

### Patch Changes

- e85269d6: Remove deprication warning from the `<Rerun>` component
- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 1.1.2

### Patch Changes

- fix key function of Entries component.

## 1.1.1

### Patch Changes

- Correct `<Entries>` types

## 1.1.0

### Minor Changes

- 2a042aa: Add `Entries` control flow component.
- c4db05a: Deprecate `<Rerun>` (use `<Show keyed>` instead)

## 1.0.2

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## 1.0.1

### Patch Changes

- e7870cb: Update deps.

## Changelog up to version 1.0.0

0.0.100

Initial release as a Stage-2 primitive.

1.0.0 - **stage-3**

Support for Solid 1.4 Store Top Level Arrays

Renamed `mapKey` -> `keyArray`
