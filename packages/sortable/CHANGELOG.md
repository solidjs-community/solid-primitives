# @solid-primitives/sortable

## 1.0.0

### Major Changes

- a402fce: Initial release of `@solid-primitives/sortable`

  Reactive sorting primitives, combining ideas from VueUse's `useSorted` and d3-array's comparator
  utilities, built directly on Solid 2.0's `mapArray` and `createProjection` rather than a bespoke
  diffing engine.

  ### `ascending` / `descending` / `by` / `combine` / `reverse`

  Comparator building blocks. `ascending`/`descending` always sort `null`/`undefined`/`NaN` to the
  end, regardless of direction — unlike a naive `a < b ? -1 : a > b ? 1 : 0`, which silently treats
  them as equal to everything. `by` derives a comparator from a key accessor; `combine` composes
  comparators for multi-key tie-breaking; `reverse` flips any comparator.

  ### `makeSorted` / `createSorted`

  Non-reactive and reactive sort. `createSorted`'s default path (a static comparator, non-`dirty`)
  delegates directly to `@solid-primitives/signal-builders`'s existing `sort()`. It adds a reactive
  comparator (an accessor, so toggling sort direction/column doesn't rebuild the primitive) and a
  `dirty: true` option that sorts the source array in place and reuses its reference — mirroring
  VueUse's `useSorted`'s `dirty` option under Solid's signal model.

  ### `sortedIndex` / `sortedIndexBy` / `insertSorted`

  Binary search over an already-sorted array, and an O(log n) immutable insert — versus an
  O(n log n) full re-sort for a single insertion.

  ### `createSortedIndex`

  Per-item reactive rank tracking: an item's index accessor only updates when _that item's_ position
  actually changes, never for unrelated moves elsewhere in the list. Built on `mapArray` — the same
  core primitive that powers `<For>` — rather than a hand-rolled diffing engine.

  ### `createSortedProjection`

  A store-shaped sorted view, reconciled by key via `createProjection`, so unrelated rows don't
  notify when one row's data changes. Pairs naturally with `<For each={projection} keyed={...}>` for
  move-not-recreate DOM behavior with no bespoke tracking code.

### Patch Changes

- e395f54: Update the primitive stage in each package's metadata: `a11y` 3, `sortable` 3, `favicon` 3, `url` 3, `workers` 3, `analytics` 2, `animation` 2, `drag-drop` 2, `async` 1. No code changes.
- c98cb2d: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- 1b703e1: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.14`.
- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [89c5324]
- Updated dependencies [5fc4efa]
- Updated dependencies [4a5bf32]
- Updated dependencies [dd165cd]
- Updated dependencies [7ee755d]
- Updated dependencies [1d6c9d3]
- Updated dependencies [4eec033]
- Updated dependencies [50e36c9]
- Updated dependencies [c98cb2d]
- Updated dependencies [1b703e1]
- Updated dependencies [638c530]
- Updated dependencies [04a170e]
- Updated dependencies [b7ef2f3]
- Updated dependencies [5c23fda]
  - @solid-primitives/utils@7.0.0
  - @solid-primitives/signal-builders@1.0.0

## 1.0.0-next.3

### Patch Changes

- e395f54: Update the primitive stage in each package's metadata: `a11y` 3, `sortable` 3, `favicon` 3, `url` 3, `workers` 3, `analytics` 2, `animation` 2, `drag-drop` 2, `async` 1. No code changes.

## 1.0.0-next.2

### Patch Changes

- 1b703e1: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.14`.
- Updated dependencies [1b703e1]
  - @solid-primitives/signal-builders@1.0.0-next.6
  - @solid-primitives/utils@7.0.0-next.6

## 1.0.0-next.1

### Patch Changes

- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [7ee755d]
- Updated dependencies [638c530]
  - @solid-primitives/utils@7.0.0-next.5
  - @solid-primitives/signal-builders@1.0.0-next.5

## 1.0.0-next.0

### Major Changes

- a402fce: Initial release of `@solid-primitives/sortable`

  Reactive sorting primitives, combining ideas from VueUse's `useSorted` and d3-array's comparator
  utilities, built directly on Solid 2.0's `mapArray` and `createProjection` rather than a bespoke
  diffing engine.

  ### `ascending` / `descending` / `by` / `combine` / `reverse`

  Comparator building blocks. `ascending`/`descending` always sort `null`/`undefined`/`NaN` to the
  end, regardless of direction — unlike a naive `a < b ? -1 : a > b ? 1 : 0`, which silently treats
  them as equal to everything. `by` derives a comparator from a key accessor; `combine` composes
  comparators for multi-key tie-breaking; `reverse` flips any comparator.

  ### `makeSorted` / `createSorted`

  Non-reactive and reactive sort. `createSorted`'s default path (a static comparator, non-`dirty`)
  delegates directly to `@solid-primitives/signal-builders`'s existing `sort()`. It adds a reactive
  comparator (an accessor, so toggling sort direction/column doesn't rebuild the primitive) and a
  `dirty: true` option that sorts the source array in place and reuses its reference — mirroring
  VueUse's `useSorted`'s `dirty` option under Solid's signal model.

  ### `sortedIndex` / `sortedIndexBy` / `insertSorted`

  Binary search over an already-sorted array, and an O(log n) immutable insert — versus an
  O(n log n) full re-sort for a single insertion.

  ### `createSortedIndex`

  Per-item reactive rank tracking: an item's index accessor only updates when _that item's_ position
  actually changes, never for unrelated moves elsewhere in the list. Built on `mapArray` — the same
  core primitive that powers `<For>` — rather than a hand-rolled diffing engine.

  ### `createSortedProjection`

  A store-shaped sorted view, reconciled by key via `createProjection`, so unrelated rows don't
  notify when one row's data changes. Pairs naturally with `<For each={projection} keyed={...}>` for
  move-not-recreate DOM behavior with no bespoke tracking code.

### Patch Changes

- Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- Updated dependencies
  - @solid-primitives/signal-builders@1.0.0-next.4
  - @solid-primitives/utils@7.0.0-next.4
