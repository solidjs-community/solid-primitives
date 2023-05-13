# @solid-primitives/i18n

## 1.4.0

### Minor Changes

- 9e3a57ed: Add better typing for `useI18n` and `useScopedI18n`

## 1.3.0

### Minor Changes

- c0e23e82: Add `useScopedI18n` helper for creating a module-specific translate

## 1.2.4

### Patch Changes

- 83843698: Use `!isServer && DEV` for checking development env to support versions prior to 1.6.12

## 1.2.3

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
- Updated dependencies [3fad3789]
  - @solid-primitives/context@0.2.1

## 1.2.2

### Patch Changes

- Updated dependencies [4135c9bf]
  - @solid-primitives/context@0.2.0

## 1.2.1

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)
- Updated dependencies [865d5ee9]
  - @solid-primitives/context@0.1.4

## 1.2.0

### Minor Changes

- 205bc4af: Added a chained typesafe provider into the i18n package

## 1.1.4

### Patch Changes

- 5525fd23: Check if `navigator` is defined before using it. (Fixes #307)

## 1.1.3

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 1.1.2

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 1.1.1

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 1.1.0

0.0.100

First commit of the i18n primitive.

1.0.0

General package clean-up and added testing facility.

1.0.1

Releasd with CJS support.

1.0.8

Patch CJS support release.

1.0.9

Updated to Solid 1.3
