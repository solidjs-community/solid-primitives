# @solid-primitives/presence

## 1.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/utils@7.0.0-next.2

## 1.0.0-next.0

### Major Changes

- 2ea3768: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependency**: `solid-js@^2.0.0-beta.14` is now required.

  ### `@solid-primitives/presence`
  - `createEffect` calls converted to the split compute/apply pattern required by Solid 2.0; cleanup is returned from the apply phase instead of calling `onCleanup`
  - Internal signals now use `{ ownedWrite: true }` to allow writes from the effect apply phases
  - No changes to the public `createPresence` API or `PresenceResult` type

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0

## 0.1.3

### Patch Changes

- Updated dependencies [6680ab9]
  - @solid-primitives/utils@6.4.0

## 0.1.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.
- Updated dependencies [396812d]
  - @solid-primitives/utils@6.3.2

## 0.1.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)
- Updated dependencies [53f08cc]
  - @solid-primitives/utils@6.3.1

## 0.1.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

### Patch Changes

- Updated dependencies [ea09f71]
  - @solid-primitives/utils@6.3.0

## 0.0.6

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.0.5

### Patch Changes

- Updated dependencies [48d44c0]
  - @solid-primitives/utils@6.2.3

## 0.0.4

### Patch Changes

- d23dd74: Add type exports for cjs
- Updated dependencies [d23dd74]
  - @solid-primitives/utils@6.2.2

## 0.0.3

### Patch Changes

- Updated dependencies [92c1e5c4]
  - @solid-primitives/utils@6.2.1

## 0.0.2

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0
