# @solid-primitives/idle

## 1.0.0-next.0

### Major Changes

- fb86c45: Migrate to Solid.js v2.0 (beta.14)

  - Updated peer dependencies to `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14`
  - Changed `isServer` import from `solid-js/web` to `@solidjs/web`
  - Replaced `onMount` with `onSettled`
  - Removed `batch` calls (Solid 2.0 batches automatically via microtasks)
  - Added `INTERNAL_OPTIONS` (`ownedWrite: true`) to signals to prevent owned-scope write warnings
  - Used `noop` from `@solid-primitives/utils` for server-side no-op methods
  - Fixed default events list: removed duplicate `"wheel"` entry (was listed twice as `"wheel"` and `"mousewheel"`)

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0

## 0.2.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.

## 0.2.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 0.2.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 0.1.2

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.1.1

### Patch Changes

- d23dd74: Add type exports for cjs

## 0.1.0

### Minor Changes

- 28d78412: Add triggerIdle function to manually trigger idle state - Fixes #503

## 0.0.105

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 0.0.104

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 0.0.103

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 0.0.102

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 0.0.101

### Patch Changes

- e3bdcfa0: Make createIdleTimer options argumnet optional.
