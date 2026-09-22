# @solid-primitives/spring

## 1.0.0-next.4

### Patch Changes

- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [7ee755d]
- Updated dependencies [638c530]
  - @solid-primitives/utils@7.0.0-next.5

## 1.0.0-next.3

### Patch Changes

- Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- Updated dependencies
  - @solid-primitives/utils@7.0.0-next.4

## 1.0.0-next.2

### Patch Changes

- Updated dependencies [b7ef2f3]
  - @solid-primitives/utils@7.0.0-next.3

## 1.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/utils@7.0.0-next.2

## 1.0.0-next.0

### Major Changes

- a944d2b: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependencies**: `solid-js@^2.0.0-beta.14`, `@solidjs/web@^2.0.0-beta.14`, and `@solid-primitives/utils@^6.4.0` are now required.

  ### `@solid-primitives/spring`
  - `isServer` is now imported from `@solidjs/web` (not `solid-js/web`)
  - Internal animated value signal is created with `{ ownedWrite: true }`, allowing `set` (the spring setter) to be called from within reactive scopes such as effect apply phases
  - `createDerivedSpring`: effect converted to split compute/apply form with `{ defer: true }` — avoids re-animating the initial value that was already set at construction time; apply phase correctly does not return the setter Promise
  - Animation cleanup function is extracted explicitly (no longer relying on `onCleanup` return value)
  - Tests updated to call `flush()` after signal writes and after RAF frame ticks, reflecting Solid 2.0's microtask-batched signal updates

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0

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
