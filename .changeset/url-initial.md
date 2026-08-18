---
"@solid-primitives/url": minor
---

Initial release targeting Solid.js v2.0 (beta.15). Reactive primitives for the Browser's `Location`, `URL`, and `URLSearchParams` interfaces — `createLocationState`/`useSharedLocationState`/`updateLocation`, `createURL`/`ReactiveURL`/`createURLRecord`, and `createSearchParams`/`ReactiveSearchParams`/`createLocationSearchParams`/`useSharedLocationSearchParams`/`getSearchParamsRecord`. Adapted from the design proposed in [PR #77](https://github.com/solidjs-community/solid-primitives/pull/77), rewritten for Solid 2.0 (`createStaticStore` instead of a hand-rolled shallow store, `@solid-primitives/trigger`'s `TriggerCache` for `ReactiveSearchParams`' granular tracking, a projection `createStore(fn, seed)` for `SearchParamsRecord`, and a guarded imperative two-way sync between `ReactiveURL.search` and `.searchParams` instead of `createComputed`/`on`, both removed in 2.0).
