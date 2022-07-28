# @solid-primitives/keyboard

## Changelog up to version 1.0.0

0.0.100

Initial release as a Stage-0 primitive.

1.0.0

[PR#159](https://github.com/solidjs-community/solid-primitives/pull/159)

General package refactor. The single initial `makeKeyHoldListener` primitive has been replaced by:

- `useKeyDownList`,
- `useCurrentlyHeldKey`,
- `useKeyDownSequence`,
- `createKeyHold`,
- `createShortcut`
