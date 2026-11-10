# @solid-primitives/presence

## 1.0.0-next.5

### Patch Changes

- a4af45b: Fix `createPresence` triggering Solid 2's `EFFECT_WRITES_OWN_SOURCE` and `EFFECT_RELAY_TEAR` warnings (#1082), for example when opening a Kobalte `Popover`.

  The internal effects used to feed back into themselves: the sync effect tracked `mountedItem()` while writing it, and watched `isMounted()`, which was itself copied from the `shouldBeMounted` signal that effect writes. Each change therefore took extra flushes to settle, and the first frame rendered stale state.

  `isMounted`, `isVisible` and `hasEntered` are now derived from the source instead of being copied around by effects. Time-driven state (the exit finished, the next frame arrived) is only written from timer and animation-frame callbacks. The swap to a new item still happens after the exit transition, once `isMounted` has been `false` for a flush, so a `<Show when={isMounted()}>` still unmounts the old item and mounts a fresh one.

  The public API is unchanged and the settled state matches the previous implementation. Intermediate frames that used to be inconsistent (for example `isVisible` still `true` for a flush after the exit started) no longer occur, and `isMounted` turns `true` in the same flush as the mount. The timing of the transitions themselves is unchanged, except that visibility can now change in an earlier render flush (`isVisible` turns `false` in the same flush the exit starts, instead of one flush later): `isVisible` still turns `true` on the next animation frame and the exit still ends after the exit duration.

  Also fixes items that are functions (for example components): they were called instead of being kept, so `mountedItem()` returned the function's result. The item is now stored in a box, because a signal cannot hold a function value directly.

  Known limitation: with plain boolean items, `createPresence` still reports `EFFECT_RELAY_TEAR` in dev when `attribution` is enabled (a boolean item is mirrored one to one into the internal mount state). This is unchanged from before.

## 1.0.0-next.4

### Patch Changes

- 1b703e1: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.14`.
- Updated dependencies [1b703e1]
  - @solid-primitives/utils@7.0.0-next.6

## 1.0.0-next.3

### Patch Changes

- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [7ee755d]
- Updated dependencies [638c530]
  - @solid-primitives/utils@7.0.0-next.5

## 1.0.0-next.2

### Patch Changes

- Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- Updated dependencies
  - @solid-primitives/utils@7.0.0-next.4

## 1.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/utils@7.0.0-next.2

## 1.0.0-next.0

### Major Changes

- 2ea3768: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependency**: `solid-js@^2.0.0-beta.14` is now required.

  ### `@solid-primitives/presence`
  - `createEffect` calls converted to the split compute/apply pattern required by Solid 2.0; cleanup is returned from the apply phase instead of calling `onCleanup`
  - Internal signals now use `{ ownedWrite: true }` to allow writes from the effect apply phases
  - No changes to the public `createPresence` API or `PresenceResult` type

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0

## 0.1.3

### Patch Changes

- Updated dependencies [6680ab9]
  - @solid-primitives/utils@6.4.0

## 0.1.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.
- Updated dependencies [396812d]
  - @solid-primitives/utils@6.3.2

## 0.1.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)
- Updated dependencies [53f08cc]
  - @solid-primitives/utils@6.3.1

## 0.1.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

### Patch Changes

- Updated dependencies [ea09f71]
  - @solid-primitives/utils@6.3.0

## 0.0.6

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.0.5

### Patch Changes

- Updated dependencies [48d44c0]
  - @solid-primitives/utils@6.2.3

## 0.0.4

### Patch Changes

- d23dd74: Add type exports for cjs
- Updated dependencies [d23dd74]
  - @solid-primitives/utils@6.2.2

## 0.0.3

### Patch Changes

- Updated dependencies [92c1e5c4]
  - @solid-primitives/utils@6.2.1

## 0.0.2

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0
