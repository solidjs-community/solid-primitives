# @solid-primitives/spring

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
