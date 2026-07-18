# @solid-primitives/interaction

## 1.0.0-next.1

### Patch Changes

- c485250: fix: `makeInteractOutside`/`createInteractOutside` firing outside-interaction callbacks from an orphaned instance whose watched element was removed from the document before its reactive owner disposed (a common race when a dismissable layer closes and a new one opens in quick succession)

## 1.0.0-next.0

### Major Changes

- 9b2475d: Migrate to Solid.js v2.0 (beta.14)

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0
