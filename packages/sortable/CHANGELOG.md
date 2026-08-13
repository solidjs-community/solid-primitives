# @solid-primitives/sortable

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
