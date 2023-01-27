# @solid-primitives/fetch

## 2.4.3

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 2.4.2

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 2.4.1

### Patch Changes

- d1622e79: fix to cache invalidation function types and cause a re-fetch on invalidation.

## 2.4.0

### Minor Changes

- 6d39bcc7: new aggregation modifier
- 38578006: expose cache key serializer

## 2.3.0

### Minor Changes

- 66d5eb39: refetch on expiry modifier added

## 2.2.0

### Minor Changes

- 6fcf348: Adjustments to support Solid 1.5

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## 2.1.0

### Minor Changes

- cf1326b: remove side effects

## 2.0.0

### Major Changes

- 0fda65c: Rewrite to allow for an extendible primitive; the previously supported AbortControllers are now handled by the withAbort modifier. Additional modifiers mostly close the feature gap between @solid-primitives/fetch and react-query.

## Changelog up to version 1.2.0

0.0.100

Initial release adapted from https://github.com/microcipcip/vue-use-kit/blob/master/src/functions/useFetch/useFetch.ts.

0.0.105

Improve test setup

0.0.106

Add tests for error case, remove stray console.warn

1.0.5

Released CJS and SSR support.

1.0.6

Added missing server entry compile in TSUP and updated to Solid.

1.0.7

Improve server entry to make node-fetch optional in cases it is not needed.

1.1.0

Update solid.

1.2.0

Allow a RequestInfo Accessor to return undefined in order to not yet make a request.

2.0.0

Rewrite to allow for an extendible primitive; the previously supported AbortControllers are now handled by the withAbort modifier. Additional modifiers mostly close the feature gap between @solid-primitives/fetch and react-query.
