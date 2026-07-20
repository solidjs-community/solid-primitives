# @solid-primitives/tween

## 2.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).

## 2.0.0-next.0

### Major Changes

- 098c39f: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependency**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  ### `@solid-primitives/tween`
  - `isServer` now imported from `@solidjs/web` (not `solid-js/web`)
  - `createEffect` updated to the two-argument compute/apply form required by Solid 2.0 — the removed `on()` helper is no longer used
  - Cleanup (cancelling the in-flight `requestAnimationFrame`) is now returned from the apply function instead of calling `onCleanup`
  - `current()` snapshot at tween start is now read inside `untrack()` to silence strict-mode warnings about untracked reads in apply callbacks

## 1.4.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 1.4.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 1.3.0

### Minor Changes

- 606af1f: Change method used for tweening (#573)

## 1.2.8

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 1.2.7

### Patch Changes

- d23dd74: Add type exports for cjs

## 1.2.6

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 1.2.5

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 1.2.4

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 1.2.3

### Patch Changes

- 45c29876: fix: specify createTween return type

## 1.2.2

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 1.2.1

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 1.2.0

1.0.0

Initial commit and publish of debounce primitive.

1.0.1

Released a new version with CJS support.

1.0.4

Shipping a tighter and better CJS supported version.

1.1.0

Added server entry and updated to Solid 1.3.
