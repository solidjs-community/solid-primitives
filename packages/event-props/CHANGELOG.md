# @solid-primitives/event-props

## 1.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).

## 1.0.0-next.0

### Major Changes

- 135a600: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependency**: `solid-js@^2.0.0-beta.14` is now required.

  ### `@solid-primitives/event-props`
  - Requires Solid.js v2 — signal writes from event handlers fire outside any reactive scope (as they always do from DOM events), consistent with Solid 2.0's owned-scope write restrictions
  - Signal writes are microtask-batched in Solid 2.0; reads reflect the committed value after the next microtask or an explicit `flush()`

## 0.3.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 0.3.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 0.2.7

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.2.6

### Patch Changes

- d23dd74: Add type exports for cjs

## 0.2.5

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 0.2.4

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 0.2.3

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 0.2.2

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 0.2.1

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 0.2.0

0.0.100

First commit.

0.0.150

Published publicly for general use.

0.1.0

Updated to latest Solid
