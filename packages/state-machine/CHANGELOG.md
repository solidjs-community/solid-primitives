# @solid-primitives/state-machine

## 1.0.0-next.0

### Major Changes

- 9adf2d2: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependencies**: `solid-js@^2.0.0-beta.14` is now required.

  - Signal writes are now batched by default; call `flush()` from `solid-js` after calling `state.to.*()` before reading reactive state in tests or synchronous non-reactive code.
  - `@solid-primitives/utils` is now a runtime dependency (used for `INTERNAL_OPTIONS` / `ownedWrite` signal option).
  - State callbacks called during machine initialization that immediately transition to another state will now require a `flush()` before reading the resulting state.

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0

## 0.2.0

### Major Changes

- Migrate to Solid.js v2.0 (beta.13)

## 0.1.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 0.1.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 0.0.3

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.0.2

### Patch Changes

- d23dd74: Add type exports for cjs
