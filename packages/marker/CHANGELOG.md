# @solid-primitives/marker

## 2.0.0-next.0

### Major Changes

- 5457e3a: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependency**: `solid-js@^2.0.0-beta.14` is now required.

  ### `createMarker`

  **`createRoot` second parameter removed** — In Solid 1.x the second argument to `createRoot` was a parent owner. In Solid 2.0 the API changed to an options object; the parent is now implicitly the current reactive context. The implementation now uses `runWithOwner(owner, () => createRoot(...))` to explicitly parent cached element roots to the marker's creation-time owner, preserving the existing lifecycle semantics.

  **Signal `ownedWrite: true`** — In Solid 2.0, writing to a signal from inside an owned reactive scope (component body, `createRoot` callback, effect compute phase) throws by default. The internal per-match signal is now created with `{ ownedWrite: true }` so that `set()` can be called when the marker function is invoked from any reactive context.

  **Deferred signal reads after `set()`** — In Solid 2.0 all signal writes are deferred until the next microtask flush. When a cached match element is reused and its text is updated via `set(newText)`, reading the signal accessor immediately returns the previously committed value. Call `flush()` from `solid-js` before reading a reused element's accessor if synchronous access is required (e.g. in tests).

## 0.2.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.

## 0.2.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 0.2.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 0.1.0

### Minor Changes

- a1f602d: fix memory leak

## 0.0.3

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.0.2

### Patch Changes

- d23dd74: Add type exports for cjs
