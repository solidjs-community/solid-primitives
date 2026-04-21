---
"@solid-primitives/media": major
"@solid-primitives/event-listener": major
"@solid-primitives/rootless": major
"@solid-primitives/static-store": major
"@solid-primitives/utils": major
---

Migrate to Solid.js v2.0 (beta.7)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.7` and `@solidjs/web@^2.0.0-beta.7` are now required.

### `@solid-primitives/media`

- `isServer` now imported from `@solidjs/web` (not `solid-js/web`)
- Requires Solid.js v2 — `classList` is replaced by `class` with object/array forms in consuming code

### `@solid-primitives/utils`

- `isServer` import moved from `solid-js/web` to `@solidjs/web`
- `createHydratableSignal`: uses `onSettled` (was `onMount`) and `sharedConfig.hydrating` (was `sharedConfig.context`) for hydration detection
- `INTERNAL_OPTIONS`: `{ internal: true }` changed to `{ pureWrite: true }` to match Solid 2.0 `SignalOptions`
- `defaultEquals` now aliases `isEqual` (was `equalFn`)
- `defer`: `AccessorArray<S>` type replaced with `Accessor<S>[]` (type was removed in Solid 2.0)

### `@solid-primitives/static-store`

- `isServer` import moved from `solid-js/web` to `@solidjs/web`
- `createStaticStore`: uses `getObserver` (was `getListener`) and `{ pureWrite: true }` (was `{ internal: true }`)
- Removed explicit `batch()` calls — updates are automatically batched in Solid 2.0
- `createHydratableStaticStore`: uses `onSettled` (was `onMount`) and `sharedConfig.hydrating` (was `sharedConfig.context`)

### `@solid-primitives/rootless`

- `isServer` import moved from `solid-js/web` to `@solidjs/web`
- `createHydratableSingletonRoot`: uses `sharedConfig.hydrating` (was `sharedConfig.context`)
- `createRootPool`: removed `batch()` calls — Solid 2.0 auto-batches on microtasks

### `@solid-primitives/event-listener`

- `isServer` import moved from `solid-js/web` to `@solidjs/web` across all source files
- `createEventListener` and `createRenderEffect` converted to split compute/apply effect pattern required by Solid 2.0
- `eventListener` directive converted to split effect pattern; cleanup is returned from apply phase instead of using `onCleanup`
