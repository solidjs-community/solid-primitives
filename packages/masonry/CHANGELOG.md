# @solid-primitives/masonry

## 2.0.0-next.0

### Major Changes

- 034e07c: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependency**: `solid-js@^2.0.0-beta.14` is now required.

  ### `@solid-primitives/masonry`

  - `mapArray` callback signature changed: the first argument is now `Accessor<T>` (not `T` directly). The implementation now calls `source()` internally, so the public API is unchanged.
  - `createMemo` no longer accepts a separate initial-value argument. The `getColumns` memo options (`equals`) are now passed as the second argument directly.
  - `createSignal<VoidFunction | undefined>` with `ownedWrite: true` — allows `createMasonry` to be called from within reactive scopes (component bodies, `createRoot`, effects) without throwing `SIGNAL_WRITE_IN_OWNED_SCOPE`.
  - Signal writes inside tests moved outside `createRoot` scope to match Solid 2.0 owned-scope write rules.
  - `flush()` added after reactive signal writes in tests to commit pending values before assertions.

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

## 0.0.7

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.0.6

### Patch Changes

- Updated dependencies [48d44c0]
  - @solid-primitives/utils@6.2.3

## 0.0.5

### Patch Changes

- d23dd74: Add type exports for cjs
- Updated dependencies [d23dd74]
  - @solid-primitives/utils@6.2.2

## 0.0.4

### Patch Changes

- Updated dependencies [92c1e5c4]
  - @solid-primitives/utils@6.2.1

## 0.0.3

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0

## 0.0.2

### Patch Changes

- Updated dependencies [2e0bcedf]
  - @solid-primitives/utils@6.1.1
