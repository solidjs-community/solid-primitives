# @solid-primitives/fetch

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
