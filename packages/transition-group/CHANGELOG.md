# @solid-primitives/transition-group

## 2.0.0-next.3

### Patch Changes

- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [7ee755d]
- Updated dependencies [638c530]
  - @solid-primitives/utils@7.0.0-next.5

## 2.0.0-next.2

### Patch Changes

- Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- Updated dependencies
  - @solid-primitives/utils@7.0.0-next.4

## 2.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/utils@7.0.0-next.2

## 2.0.0-next.0

### Major Changes

- 9b2475d: Migrate to Solid.js v2.0 (beta.14)

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0

## 1.1.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.

## 1.1.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 1.1.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 1.0.5

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 1.0.4

### Patch Changes

- d23dd74: Add type exports for cjs

## 1.0.3

### Patch Changes

- a6e6cf9f: Correct order of callbacks in parallel switch transition.

## 1.0.2

### Patch Changes

- ef0c0a0e: fix homepage url in package.json

## 1.0.1

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 1.0.0

### Major Changes

- 1ba2f037: Initial release. Adds `createSwitchTransition` and `createListTransition` primitives.

### Patch Changes

- ba06b334: Remove effects - change the rendered array and call transitions in a pure computation.
- 2b4fb9be: Improve `appear` SSR - always render the initial items.

## 0.0.1-beta.2

### Patch Changes

- Remove effects - change the rendered array and call transitions in a pure computation.

## 0.0.1-beta.1

### Patch Changes

- 2b4fb9be: Improve `appear` SSR - always render the initial items.

## 0.0.1-beta.0

### Major Changes

- Initial release. Adds `createSwitchTransition` and `createListTransition` primitives.
