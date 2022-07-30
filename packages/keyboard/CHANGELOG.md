# @solid-primitives/keyboard

## 1.0.1

### Patch Changes

- Updated dependencies [73b6a34]
  - @solid-primitives/utils@3.0.0
  - @solid-primitives/event-listener@2.2.1
  - @solid-primitives/rootless@1.1.2

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
