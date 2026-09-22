# @solid-primitives/masonry

## 2.0.0-next.3

### Patch Changes

- 7ee755d: Stop writing signals during server renders, and ship ref-factory forms of the remaining `use:`-shaped directives.

  Solid 2 (`2.0.0-rc.1`+) flags a signal or store setter that runs during a server render (`SERVER_WRITE`): the write lands as inert data today and will throw in a later release. Eight primitives still did this:

  - `@solid-primitives/utils`: new `createServerSafeSignal(value, options)` — `createSignal` on the client; on the server the signal is still created (so hydration ids stay aligned) but reads and writes go to a plain box. For primitives that hold interactive state with no async source.
  - `@solid-primitives/analytics`, `@solid-primitives/list-state`, `@solid-primitives/queue`, and `createInfiniteScroll` in `@solid-primitives/pagination`: internal state uses `createServerSafeSignal`.
  - `@solid-primitives/controlled-signal`: on the server an uncontrolled write lands in a plain override instead of the signal; reads and `onChange` behave as before.
  - `@solid-primitives/date`: `createCountdown` is now a derived store (`createStore(fn, seed)`) instead of a render effect writing into one — the shape upstream prescribes.
  - `@solid-primitives/masonry`: the one-shot signal that wired items to the layout memo is a plain variable.
  - `@solid-primitives/pagination`: `createPagination` no longer reads its options at the top level of the calling component (`STRICT_READ_UNTRACKED`).
  - `@solid-primitives/tween`: the effect's apply phase reads the current value with `untrack` (`STRICT_READ_UNTRACKED`).

  `@solid-primitives/event-listener` and `@solid-primitives/pointer`: `eventListener`, `pointerPosition` and `pointerHover` now return a ref callback when called with props alone — `<button ref={eventListener(["click", onClick])} />`, `<div ref={pointerHover(setHovering)} />` — matching the `ref` directive shape Solid 2 replaced `use:` with. The two-argument `(el, props)` form still works.

- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [7ee755d]
- Updated dependencies [638c530]
  - @solid-primitives/utils@7.0.0-next.5

## 2.0.0-next.2

### Patch Changes

- Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- Updated dependencies
  - @solid-primitives/utils@7.0.0-next.4

## 2.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/utils@7.0.0-next.2

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
