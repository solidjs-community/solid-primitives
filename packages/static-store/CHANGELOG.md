# @solid-primitives/static-store

## 1.0.0-next.0

### Major Changes

- 4a5bf32: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependency**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  ### `@solid-primitives/media`

  - `isServer` now imported from `@solidjs/web` (not `solid-js/web`)
  - Requires Solid.js v2 — `classList` is replaced by `class` with object/array forms in consuming code

  ### `@solid-primitives/utils`

  - `isServer` import moved from `solid-js/web` to `@solidjs/web`
  - `createHydratableSignal`: uses `onSettled` (was `onMount`) and `sharedConfig.hydrating` (was `sharedConfig.context`) for hydration detection
  - `INTERNAL_OPTIONS`: `{ internal: true }` changed to `{ pureWrite: true }` to match Solid 2.0 `SignalOptions`
  - `defaultEquals` now aliases `isEqual` (was `equalFn`)
  - `defer`: `AccessorArray<S>` type replaced with `Accessor<S>[]` (type was removed in Solid 2.0)

  ### `@solid-primitives/static-store`

  - `isServer` import moved from `solid-js/web` to `@solidjs/web`
  - `createStaticStore`: uses `getObserver` (was `getListener`) and `{ pureWrite: true }` (was `{ internal: true }`)
  - Removed explicit `batch()` calls — updates are automatically batched in Solid 2.0
  - `createHydratableStaticStore`: uses `onSettled` (was `onMount`) and `sharedConfig.hydrating` (was `sharedConfig.context`)

  ### `@solid-primitives/rootless`

  - `isServer` import moved from `solid-js/web` to `@solidjs/web`
  - `createHydratableSingletonRoot`: uses `sharedConfig.hydrating` (was `sharedConfig.context`)
  - `createRootPool`: removed `batch()` calls — Solid 2.0 auto-batches on microtasks

  ### `@solid-primitives/event-listener`

  - `isServer` import moved from `solid-js/web` to `@solidjs/web` across all source files
  - `createEventListener` and `createRenderEffect` converted to split compute/apply effect pattern required by Solid 2.0
  - `eventListener` directive converted to split effect pattern; cleanup is returned from apply phase instead of using `onCleanup`

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

## 0.0.9

### Patch Changes

- 56d9511: fix: static-store setValue with setterFn has correct arguments

## 0.0.8

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.0.7

### Patch Changes

- Updated dependencies [48d44c0]
  - @solid-primitives/utils@6.2.3

## 0.0.6

### Patch Changes

- d23dd74: Add type exports for cjs
- Updated dependencies [d23dd74]
  - @solid-primitives/utils@6.2.2

## 0.0.5

### Patch Changes

- Updated dependencies [92c1e5c4]
  - @solid-primitives/utils@6.2.1

## 0.0.4

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0

## 0.0.3

### Patch Changes

- Updated dependencies [2e0bcedf]
  - @solid-primitives/utils@6.1.1

## 0.0.2

### Patch Changes

- Updated dependencies [2f6d3732]
  - @solid-primitives/utils@6.0.0
