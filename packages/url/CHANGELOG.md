# @solid-primitives/url

## 0.2.0

### Minor Changes

- f2861b4: Initial release targeting Solid.js v2.0 (beta.15). Reactive primitives for the Browser's `Location`, `URL`, and `URLSearchParams` interfaces — `createLocationState`/`useSharedLocationState`/`updateLocation`, `createURL`/`ReactiveURL`/`createURLRecord`, and `createSearchParams`/`ReactiveSearchParams`/`createLocationSearchParams`/`useSharedLocationSearchParams`/`getSearchParamsRecord`. Adapted from the design proposed in [PR #77](https://github.com/solidjs-community/solid-primitives/pull/77), rewritten for Solid 2.0 (`createStaticStore` instead of a hand-rolled shallow store, `@solid-primitives/trigger`'s `TriggerCache` for `ReactiveSearchParams`' granular tracking, a projection `createStore(fn, seed)` for `SearchParamsRecord`, and a guarded imperative two-way sync between `ReactiveURL.search` and `.searchParams` instead of `createComputed`/`on`, both removed in 2.0).

### Patch Changes

- e395f54: Update the primitive stage in each package's metadata: `a11y` 3, `sortable` 3, `favicon` 3, `url` 3, `workers` 3, `analytics` 2, `animation` 2, `drag-drop` 2, `async` 1. No code changes.
- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- c98cb2d: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- 1b703e1: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.14`.
- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [89c5324]
- Updated dependencies [cc30d55]
- Updated dependencies [5fc4efa]
- Updated dependencies [a47cf15]
- Updated dependencies [ab4c926]
- Updated dependencies [4a5bf32]
- Updated dependencies [dd165cd]
- Updated dependencies [7ee755d]
- Updated dependencies [50e36c9]
- Updated dependencies [c98cb2d]
- Updated dependencies [1b703e1]
- Updated dependencies [638c530]
- Updated dependencies [04a170e]
- Updated dependencies [254a964]
- Updated dependencies [91a92aa]
- Updated dependencies [b7ef2f3]
- Updated dependencies [5c23fda]
  - @solid-primitives/utils@7.0.0
  - @solid-primitives/event-listener@3.0.0
  - @solid-primitives/rootless@2.0.0
  - @solid-primitives/static-store@1.0.0
  - @solid-primitives/trigger@3.0.0

## 0.2.0-next.5

### Patch Changes

- e395f54: Update the primitive stage in each package's metadata: `a11y` 3, `sortable` 3, `favicon` 3, `url` 3, `workers` 3, `analytics` 2, `animation` 2, `drag-drop` 2, `async` 1. No code changes.

## 0.2.0-next.4

### Patch Changes

- 1b703e1: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.14`.
- Updated dependencies [1b703e1]
  - @solid-primitives/event-listener@3.0.0-next.7
  - @solid-primitives/rootless@2.0.0-next.4
  - @solid-primitives/static-store@1.0.0-next.4
  - @solid-primitives/trigger@3.0.0-next.4
  - @solid-primitives/utils@7.0.0-next.6

## 0.2.0-next.3

### Patch Changes

- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [7ee755d]
- Updated dependencies [638c530]
  - @solid-primitives/utils@7.0.0-next.5
  - @solid-primitives/event-listener@3.0.0-next.6
  - @solid-primitives/rootless@2.0.0-next.3
  - @solid-primitives/static-store@1.0.0-next.3
  - @solid-primitives/trigger@3.0.0-next.3

## 0.2.0-next.2

### Patch Changes

- Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- Updated dependencies
  - @solid-primitives/event-listener@3.0.0-next.3
  - @solid-primitives/rootless@2.0.0-next.2
  - @solid-primitives/static-store@1.0.0-next.2
  - @solid-primitives/trigger@3.0.0-next.2
  - @solid-primitives/utils@7.0.0-next.4

## 0.2.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/event-listener@3.0.0-next.2
  - @solid-primitives/rootless@2.0.0-next.1
  - @solid-primitives/static-store@1.0.0-next.1
  - @solid-primitives/trigger@3.0.0-next.1
  - @solid-primitives/utils@7.0.0-next.2

## 0.2.0-next.0

### Minor Changes

- f2861b4: Initial release targeting Solid.js v2.0 (beta.15). Reactive primitives for the Browser's `Location`, `URL`, and `URLSearchParams` interfaces — `createLocationState`/`useSharedLocationState`/`updateLocation`, `createURL`/`ReactiveURL`/`createURLRecord`, and `createSearchParams`/`ReactiveSearchParams`/`createLocationSearchParams`/`useSharedLocationSearchParams`/`getSearchParamsRecord`. Adapted from the design proposed in [PR #77](https://github.com/solidjs-community/solid-primitives/pull/77), rewritten for Solid 2.0 (`createStaticStore` instead of a hand-rolled shallow store, `@solid-primitives/trigger`'s `TriggerCache` for `ReactiveSearchParams`' granular tracking, a projection `createStore(fn, seed)` for `SearchParamsRecord`, and a guarded imperative two-way sync between `ReactiveURL.search` and `.searchParams` instead of `createComputed`/`on`, both removed in 2.0).
