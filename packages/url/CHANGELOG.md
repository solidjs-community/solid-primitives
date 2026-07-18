# @solid-primitives/url

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
