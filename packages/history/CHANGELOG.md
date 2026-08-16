# @solid-primitives/history

## 1.0.0-next.3

### Patch Changes

- c061229: Fix two independent bugs in `createUndoHistory` that could each cause `undo`/`redo` to misfire — the second affects single-source usage too, not just multiple sources.

  **Microtask race on the internal "ignore" flag.** The previous implementation suppressed re-recording a history entry during `undo`/`redo` with a flag (`ignoreNext`) reset via a separately-scheduled microtask (`createMicrotask`). Since Solid 2.0 batches signal writes into their own microtask-scheduled flush, the flag's reset microtask could resolve _before_ the write's own flush — so the restore triggered by `undo`/`redo` got recorded as a brand-new history entry instead of being suppressed, corrupting `canRedo`/`canUndo` bookkeeping. This reproduces with a single source and no multi-source setup at all. The rewrite replaces the flag with `createOptimistic`, whose revert is coordinated by Solid's own flush (it runs after the same flush's pending recomputes, not via an independent competing microtask), which structurally removes this race.

  **Misaligned/spurious restores with multiple sources.** Separately, each history entry stored a compacted array of setters, dropping any paused source — so entries on either side of a pause/resume boundary could end up with different lengths, causing `undo`/`redo` to compare setters by the wrong array index and either restore the wrong source or spuriously re-fire one that hadn't actually changed. Entries now keep a fixed-length slot per source (`undefined` when paused), so index alignment is stable across every recorded entry.

  Also fixes the `limit` option: the default silently became unbounded and `limit: 0` no longer meant zero retention. Restored the documented default of `100` and made trimming unconditional so `limit: 0` correctly retains no undo history.

  Credit to @mesram, whose `createStore`/`createOptimistic`-based rewrite is the basis for this fix.

## 1.0.0-next.2

### Patch Changes

- Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- Updated dependencies
  - @solid-primitives/utils@7.0.0-next.4

## 1.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/utils@7.0.0-next.2

## 1.0.0-next.0

### Major Changes

- ae3016f: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependency**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  ### `@solid-primitives/history`
  - `isServer` import moved from `solid-js/web` to `@solidjs/web`
  - `batch()` removed from `undo()` and `redo()` — Solid 2.0 batches signal updates automatically; call `flush()` before reading `canUndo()`/`canRedo()` in tests or non-reactive (non-render) contexts
  - Internal count signal uses `{ pureWrite: true }` for Solid 2.0 signal semantics
  - `createMemo` initial state is now managed via an explicit `initialState` reference — Solid 2.0's `createMemo` passes `undefined` as `prev` on the first call, unlike Solid 1.x which passed the `init` argument
  - Added SSR test coverage (`test/server.test.ts`)

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0

## 0.3.0

### Minor Changes

- Migrate to Solid.js v2.0 (beta.10)

### Breaking Changes

- **Peer dependency**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.
- `isServer` import moved from `solid-js/web` to `@solidjs/web`.
- `batch()` removed from `undo()` and `redo()` — Solid 2.0 batches signal updates automatically. Call `flush()` before reading `canUndo()`/`canRedo()` in tests or non-reactive contexts.
- Internal count signal uses `{ pureWrite: true }` for Solid 2.0 signal semantics.
- `createMemo` initial value handled via an explicit `initialState` reference to accommodate Solid 2.0's `undefined`-prev first-call behavior.

## 0.2.3

### Patch Changes

- Updated dependencies [6680ab9]
  - @solid-primitives/utils@6.4.0

## 0.2.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.
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

## 0.1.5

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.1.4

### Patch Changes

- Updated dependencies [48d44c0]
  - @solid-primitives/utils@6.2.3

## 0.1.3

### Patch Changes

- d23dd74: Add type exports for cjs
- Updated dependencies [d23dd74]
  - @solid-primitives/utils@6.2.2

## 0.1.2

### Patch Changes

- Updated dependencies [92c1e5c4]
  - @solid-primitives/utils@6.2.1

## 0.1.1

### Patch Changes

- 2c9d3238: Add `void` as a possible return type.

## 0.1.0

### Minor Changes

- 2157af7d: Allow falsy values to be returned from the source function to not create a point in history.

## 0.0.2

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0
