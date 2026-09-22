# @solid-primitives/sortable

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
