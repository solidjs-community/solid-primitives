# @solid-primitives/queue

## 1.0.0-next.4

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

## 1.0.0-next.3

### Patch Changes

- Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- Updated dependencies
  - @solid-primitives/utils@7.0.0-next.4

## 1.0.0-next.2

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/utils@7.0.0-next.2

## 1.0.0-next.1

### Patch Changes

- 5fc4efa: Fix named imports breaking under Rolldown (Vite 8+ / Storybook 10.4.6+) bundlers.

  These packages re-export their public API via `export * from "./x.js"` barrels. Rollup resolves named imports through these at link time, but Rolldown's static analysis doesn't reliably follow `export *` for named-export resolution, causing errors like:

  ```
  "createEventListener" is not exported by "@solid-primitives/event-listener/dist/index.js"
  ```

  The build now also emits explicit `export { name } from "./x.js"` lines for every runtime export reachable through a barrel's `export *`, derived automatically from each submodule's compiled output — so `dist/` is bundler-agnostic regardless of how a given tool resolves star re-exports.

- Updated dependencies [5fc4efa]
  - @solid-primitives/utils@7.0.0-next.1

## 1.0.0-next.0

### Major Changes

- e4c9991: Initial release of `@solid-primitives/queue`

  Six primitives for managing queues:

  - **`makeQueue<T>(initialValues?)`** — non-reactive FIFO queue backed by a plain array.
  - **`createQueue<T>(initialValues?)`** — reactive FIFO queue backed by Solid signals. Exposes reactive accessors (`queue`, `first`, `last`, `size`, `isEmpty`) and imperative methods (`add`, `remove`, `clear`).
  - **`makePriorityQueue<T, Q>(q, comparator)`** — queue modifier that turns any existing queue into a priority queue by overriding its `add` method to maintain comparator-sorted order. Returns the same queue object with `add` patched in place.
  - **`createPriorityQueue<T>(comparator, initialValues?)`** — reactive priority queue; same interface as `createQueue`.
  - **`createTaskQueue<T>()`** — reactive async task queue. Tasks execute one at a time in FIFO order. `enqueue(task)` returns a `Promise<T>`. Exposes reactive `size` (pending count) and `active` (`boolean`).
  - **`createConcurrentTaskQueue<T>(concurrency)`** — reactive async task queue running up to `concurrency` tasks simultaneously. `active` is a count (`Accessor<number>`).

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0

## 0.1.0

### Initial release

- `makeQueue<T>(initialValues?)` — non-reactive FIFO queue backed by a plain array
- `createQueue<T>(initialValues?)` — reactive FIFO queue backed by Solid signals; exposes `queue`, `first`, `last`, `size`, `isEmpty`, `add`, `remove`, `clear`
- `makePriorityQueue<T>(q, comparator)` — queue modifier; patches an existing queue's `add` method to maintain comparator-sorted order; returns the same queue
- `createPriorityQueue<T>(comparator, initialValues?)` — reactive priority queue; same interface as `createQueue`
- `createTaskQueue<T>()` — reactive async task queue; tasks execute one at a time in FIFO order; `enqueue(task)` returns a Promise for the task's result; exposes reactive `size` and `active`
- `createConcurrentTaskQueue<T>(concurrency)` — reactive async task queue running up to `concurrency` tasks simultaneously; `active` is a count (`Accessor<number>`)
