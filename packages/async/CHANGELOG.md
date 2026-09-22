# @solid-primitives/async

## 0.0.101-next.4

### Patch Changes

- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

## 0.0.101-next.3

### Patch Changes

- Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.

## 0.0.101-next.2

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).

## 0.0.101-next.1

### Patch Changes

- eb986d4: Fixed inaccurate documentation and test-suite reliability issues; no API changes.

  - `makeAbortable`/`createAbortable` JSDoc described `autoAbort` backwards (said "set to `true`" to opt out, when the code checks for `false`) and referenced a nonexistent `noAutoAbort` option instead of `autoAbort`
  - README: fixed a broken Node.js `fromStream` example (was passing a stream where a fetcher function is required), removed an invalid extra generic on `fromJSONStream`'s signature, documented the previously-undocumented `chainTo` option on `makeAbortable`/`createAbortable`, and corrected `createAggregated`'s signature (was missing the `memoOptions` parameter)
  - Fixed `makeRetrying` tests creating pre-rejected promises ahead of time, which caused unhandled promise rejection errors (and a non-zero exit code) even though all assertions passed
  - Fixed the SSR test for `fromStream` resolving `README.md` via a path relative to `process.cwd()` instead of the test file, which failed depending on where the test runner was invoked from

## 0.0.101-next.0

### Patch Changes

- 6b02a3a: new package: async (to partially replace resource)
