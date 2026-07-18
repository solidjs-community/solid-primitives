# @solid-primitives/async

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
