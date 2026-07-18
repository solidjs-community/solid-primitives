# @solid-primitives/flux-store

## 1.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).

## 1.0.0-next.0

### Major Changes

- c50bb56: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependencies**: `solid-js@^2.0.0-beta.14` is now required.

  **Store setter is now draft-first.** The `setState` function received in the `actions` callback no longer accepts path-style arguments. Instead, pass a draft mutator function:

  ```ts
  // Before (Solid 1.x)
  actions: setState => ({
    increment(by = 1) {
      setState("value", p => p + by);
    },
    reset() {
      setState("value", 0);
    },
  });

  // After (Solid 2.0)
  actions: setState => ({
    increment(by = 1) {
      setState(s => {
        s.value += by;
      });
    },
    reset() {
      setState(s => {
        s.value = 0;
      });
    },
  });
  ```

  **`produce` helper removed.** Solid 2.0 stores use draft-first mutation by default, so `produce` is no longer necessary or available. Replace any `setState(produce(s => ...))` calls with `setState(s => ...)`.

  **`batch` wrapper removed from `createAction`.** All writes in Solid 2.0 are auto-batched, so the explicit `batch()` wrap has been removed from `createAction`. Actions remain `untrack`ed.

  **Import paths updated:** `createStore` and `StoreSetter` (formerly `SetStoreFunction`) are now imported from `solid-js` directly (store types were merged into the main package).

## 0.1.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 0.1.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 0.0.4

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.0.3

### Patch Changes

- d23dd74: Add type exports for cjs

## 0.0.2

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 0.0.100

- Initial commit and [**PR**](https://github.com/solidjs-community/solid-primitives/pull/327).
