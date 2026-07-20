# @solid-primitives/lifecycle

## 1.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).

## 1.0.0-next.0

### Major Changes

- 9453354: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  - `isServer` is now imported from `@solidjs/web` (was `solid-js/web`)
  - `onMount` replaced with `onSettled` — `createIsMounted` now schedules its signal update after the owner settles
  - `getListener` replaced with `getObserver` — `isHydrated` uses `getObserver` to detect reactive context
  - `sharedConfig.context` replaced with `sharedConfig.hydrating` — `isHydrated` now reads the boolean `hydrating` flag
  - `renderToString` in server tests now imported from `@solidjs/web` (was `solid-js/web`)

  No changes to the public API: `createIsMounted`, `isHydrated`, and `onElementConnect` signatures are unchanged.

## 0.1.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.

## 0.1.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 0.1.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 0.0.102

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.0.101

### Patch Changes

- d23dd74: Add type exports for cjs
