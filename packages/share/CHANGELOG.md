# @solid-primitives/share

## 2.0.5

### Patch Changes

- d23dd74: Add type exports for cjs

## 2.0.4

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 2.0.3

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 2.0.2

### Patch Changes

- 646f576a: Add `createHydrateSignal` primitive to utils and fix hydration issues

## 2.0.1

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 2.0.0

### Major Changes

- aa2fcb52: Add `makeWebShare` and `createWebShare` primitives. Rename network variables to UPPERCASE. Make `createSocialShare` a named export, instead of default.

## 1.0.3

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 0.1.1

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 0.1.0

0.0.100

Initial release as a Stage-0 primitive.

0.0.105

Added CJS and SSR support.

0.0.150

Updated to Solid 1.3

1.0.1

Updated to Solid 1.5.5, corrected/simplified exports and types. Updated README with docs and definition.

1.0.2

Ensured that the package is SSR friendly.
