# @solid-primitives/virtual

## 1.0.0-next.0

### Major Changes

- 49acc0f: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependency**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  ### `@solid-primitives/virtual`

  - **`createVirtualList`**: returns `[Accessor<VirtualState>, onScroll]` — the first element is now an Accessor that must be called to read `containerHeight`, `viewerTop`, and `visibleItems`.
  - **`VirtualList` children**: the child render function now receives `(item: Accessor<T>, index: Accessor<number>)` — `item` is an Accessor and must be called as `item()` to get the value. This matches Solid 2.0's `<For>` component behavior.
  - **`{ ownedWrite: true }`**: the internal scroll offset signal uses `ownedWrite` to allow writes from the `onScroll` event handler outside the owning reactive scope.

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0

## 0.2.3

### Patch Changes

- Updated dependencies [6680ab9]
  - @solid-primitives/utils@6.4.0

## 0.2.2

### Patch Changes

- Updated dependencies [396812d]
  - @solid-primitives/utils@6.3.2

## 0.2.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)
- Updated dependencies [53f08cc]
  - @solid-primitives/utils@6.3.1

## 0.2.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

### Patch Changes

- Updated dependencies [ea09f71]
  - @solid-primitives/utils@6.3.0

## 0.1.1

### Patch Changes

- b3d7917: Add solid export condition

## 0.1.0

### Minor Changes

- e1ebe61: Add a headless virtual list primitive: `createVirtualList` in #702
