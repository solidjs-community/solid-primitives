# @solid-primitives/broadcast-channel

## 1.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).

## 1.0.0-next.0

### Major Changes

- df9779c: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  - `isServer` is now imported from `@solidjs/web` (was `solid-js/web`)
  - `createEffect` usage follows the split compute/apply pattern required by Solid 2.0 — single-argument `createEffect` is no longer supported

## 0.1.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 0.1.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 0.0.105

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.0.104

### Patch Changes

- d23dd74: Add type exports for cjs

## 0.0.103

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 0.0.102

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 0.0.101

### Patch Changes

- dd2d7d1c: Improve export conditions.
