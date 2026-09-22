# @solid-primitives/pagination

## 1.0.0-next.9

### Patch Changes

- 7ee755d: Stop writing signals during server renders, and ship ref-factory forms of the remaining `use:`-shaped directives.

  Solid 2 (`2.0.0-rc.1`+) flags a signal or store setter that runs during a server render (`SERVER_WRITE`): the write lands as inert data today and will throw in a later release. Eight primitives still did this:

  - `@solid-primitives/utils`: new `createServerSafeSignal(value, options)` — `createSignal` on the client; on the server the signal is still created (so hydration ids stay aligned) but reads and writes go to a plain box. For primitives that hold interactive state with no async source.
  - `@solid-primitives/analytics`, `@solid-primitives/list-state`, `@solid-primitives/queue`, and `createInfiniteScroll` in `@solid-primitives/pagination`: internal state uses `createServerSafeSignal`.
  - `@solid-primitives/controlled-signal`: on the server an uncontrolled write lands in a plain override instead of the signal; reads and `onChange` behave as before.
  - `@solid-primitives/date`: `createCountdown` is now a derived store (`createStore(fn, seed)`) instead of a render effect writing into one — the shape upstream prescribes.
  - `@solid-primitives/masonry`: the one-shot signal that wired items to the layout memo is a plain variable.
  - `@solid-primitives/pagination`: `createPagination` no longer reads its options at the top level of the calling component (`STRICT_READ_UNTRACKED`).
  - `@solid-primitives/tween`: the effect's apply phase reads the current value with `untrack` (`STRICT_READ_UNTRACKED`).

  `@solid-primitives/event-listener` and `@solid-primitives/pointer`: `eventListener`, `pointerPosition` and `pointerHover` now return a ref callback when called with props alone — `<button ref={eventListener(["click", onClick])} />`, `<div ref={pointerHover(setHovering)} />` — matching the `ref` directive shape Solid 2 replaced `use:` with. The two-argument `(el, props)` form still works.

- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [7ee755d]
- Updated dependencies [638c530]
  - @solid-primitives/utils@7.0.0-next.5

## 1.0.0-next.8

### Patch Changes

- a47cf15: Republish only, no functional changes. `event-listener@3.0.0-next.4` and `pagination@1.0.0-next.7` were accidentally published to npm with an unresolved pnpm workspace-catalog protocol string (`"catalog:peer"`) left in `peerDependencies`, instead of a resolved semver range. npm and yarn have no concept of the `catalog:` protocol, so installing either of those exact versions fails with `EUNSUPPORTEDPROTOCOL`. This release republishes both packages with `peerDependencies` correctly resolved (e.g. `"solid-js": "^2.0.0-rc.0"`). If you're on `event-listener@3.0.0-next.4` or `pagination@1.0.0-next.7`, upgrade to this version or later.

## 1.0.0-next.7

### Minor Changes

- 97e7cf8: pagination: new ellipsis pattern

## 1.0.0-next.6

### Patch Changes

- Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- Updated dependencies
  - @solid-primitives/utils@7.0.0-next.4

## 1.0.0-next.5

### Patch Changes

- 3762864: Removed a leftover `declare module "solid-js"` global JSX augmentation (and its associated unused `_E` type alias) from `createInfiniteScroll`. It was left over from an earlier `use:` directive-based implementation that was replaced by the current plain ref-callback API (`loader: (el: Element) => void`) — nothing in the package referenced it anymore. JSR's publish step rejects packages that modify global types, which was blocking `deno publish` for this package. No API or behavior changes.

## 1.0.0-next.4

### Minor Changes

- 830248b: add `initialPageCount` option to `createInfiniteScroll`, letting SSR request pages up front (for SEO/perceived speed) instead of always starting empty on the server

## 1.0.0-next.3

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/utils@7.0.0-next.2

## 1.0.0-next.2

### Patch Changes

- 71c6bc2: fix keyboard focus loss

## 1.0.0-next.1

### Minor Changes

- 4a511cf: Add `firstAriaLabel`/`prevAriaLabel`/`nextAriaLabel`/`lastAriaLabel` options to `createPagination`, applied as an `aria-label` on the corresponding button props (resolves #750). Previously the first/prev/next/last buttons had no accessible name beyond their visible content, which defaults to bare symbols (`|<`, `<`, `>`, `>|`) — screen reader users got no meaningful announcement. Defaults are `"First page"`, `"Previous page"`, `"Next page"`, `"Last page"`; override any of them independently. These are separate from the existing `firstContent`/`prevContent`/`nextContent`/`lastContent` options, which control visible (possibly JSX/icon) content — `aria-label` must be a plain string, so it can't reuse those.

## 1.0.0-next.0

### Major Changes

- b3a91c6: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  ### `@solid-primitives/pagination`
  - `isServer` now imported from `@solidjs/web` (not `solid-js/web`)
  - `createPagination`: page clamping when pages count decreases is now implemented via a derived memo instead of `createComputed` (which was removed in Solid 2.0). The clamping is reactive and automatic.
  - `createInfiniteScroll`: removed `createResource` dependency (removed in Solid 2.0). Fetching is now implemented with `createEffect` and a cancellation pattern. The `pages.loading` and `pages.error` resource properties are no longer available; use `end()` or wrap the fetcher to handle errors externally.
  - `batch()` calls removed — Solid 2.0 batches updates automatically via microtasks. Tests require `flush()` after signal writes to observe committed values.
  - All internal signals use `{ ownedWrite: true }` to allow setters to be called from reactive scopes and event handlers without triggering ownership warnings.

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0

## 0.5.1

### Patch Changes

- Updated dependencies [6680ab9]
  - @solid-primitives/utils@6.4.0

## 0.5.0

### Minor Changes

- b9d71b4: new segmentation primitive, jump pages, fix set page to non-existent page, fix demo

## 0.4.3

### Patch Changes

- 48d890d: Add missing type keyword to type imports.

## 0.4.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.
- Updated dependencies [396812d]
  - @solid-primitives/utils@6.3.2

## 0.4.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)
- Updated dependencies [53f08cc]
  - @solid-primitives/utils@6.3.1

## 0.4.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

### Patch Changes

- Updated dependencies [ea09f71]
  - @solid-primitives/utils@6.3.0

## 0.3.0

### Minor Changes

- 7ba7e1d: infinite scolling: fix suspense

## 0.2.12

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.2.11

### Patch Changes

- Updated dependencies [48d44c0]
  - @solid-primitives/utils@6.2.3

## 0.2.10

### Patch Changes

- d23dd74: Add type exports for cjs
- Updated dependencies [d23dd74]
  - @solid-primitives/utils@6.2.2

## 0.2.9

### Patch Changes

- 0b589d42: Fix of back and next page values

## 0.2.8

### Patch Changes

- Updated dependencies [92c1e5c4]
  - @solid-primitives/utils@6.2.1

## 0.2.7

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0

## 0.2.6

### Patch Changes

- Updated dependencies [2e0bcedf]
  - @solid-primitives/utils@6.1.1

## 0.2.5

### Patch Changes

- f2f77197: Remove intersection-observer package dependency

## 0.2.4

### Patch Changes

- Updated dependencies [2f6d3732]
  - @solid-primitives/utils@6.0.0
  - @solid-primitives/intersection-observer@2.0.11

## 0.2.3

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
- Updated dependencies [3fad3789]
  - @solid-primitives/intersection-observer@2.0.9
  - @solid-primitives/utils@5.5.1

## 0.2.2

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0
  - @solid-primitives/intersection-observer@2.0.8

## 0.2.2-beta.0

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0-beta.0
  - @solid-primitives/intersection-observer@2.0.8-beta.0

## 0.2.1

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)
- Updated dependencies [865d5ee9]
  - @solid-primitives/intersection-observer@2.0.7
  - @solid-primitives/utils@5.2.1

## 0.2.0

### Minor Changes

- 46a2ae79: make options reactive, prevent wrong page slice

## 0.1.0

### Minor Changes

- a6277325: added new `createInfiniteScroll` primitive

## 0.0.103

### Patch Changes

- Updated dependencies [c2866ea6]
  - @solid-primitives/utils@5.0.0

## 0.0.102

### Patch Changes

- dd2d7d1c: Improve export conditions.
- Updated dependencies [dd2d7d1c]
  - @solid-primitives/utils@4.0.1

## 0.0.101

### Patch Changes

- 6d8ed09b: initial release: pagination
