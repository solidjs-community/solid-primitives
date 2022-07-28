# @solid-primitives/memo

## Changelog up to version 1.0.0

0.0.100

Initial release as a Stage-1 primitive.

0.0.200

Add `createWritableMemo`. rename `createCache` to `createMemoCache`.

0.0.300

Add `createCurtain`. refactor `createWritableMemo`.

0.1.1

Support for Solid 1.4

0.2.1

`createLazyMemo` improvements

0.3.0

Improve how `createPureReaction`, `createThrottledMemo` and `createDebouncedMemo` work when created during batched effect.

Provida a separate tuntime for server.

1.0.0 - **stage-3**

[PR#158](https://github.com/solidjs-community/solid-primitives/pull/158)

Add `createDebouncedMemoOn` primitive.

Move the initial value argument from options to a separate argument in `createDebouncedMemo` and `createThrottledMemo` primitives.
