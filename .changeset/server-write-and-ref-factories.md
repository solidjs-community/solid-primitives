---
"@solid-primitives/utils": minor
"@solid-primitives/event-listener": minor
"@solid-primitives/pointer": minor
"@solid-primitives/analytics": patch
"@solid-primitives/controlled-signal": patch
"@solid-primitives/date": patch
"@solid-primitives/list-state": patch
"@solid-primitives/masonry": patch
"@solid-primitives/pagination": patch
"@solid-primitives/queue": patch
"@solid-primitives/tween": patch
---

Stop writing signals during server renders, and ship ref-factory forms of the remaining `use:`-shaped directives.

Solid 2 (`2.0.0-rc.1`+) flags a signal or store setter that runs during a server render (`SERVER_WRITE`): the write lands as inert data today and will throw in a later release. Eight primitives still did this:

- `@solid-primitives/utils`: new `createServerSafeSignal(value, options)` — `createSignal` on the client; on the server the signal is still created (so hydration ids stay aligned) but reads and writes go to a plain box. For primitives that hold interactive state with no async source.
- `@solid-primitives/analytics`, `@solid-primitives/list-state`, `@solid-primitives/queue`, and `createInfiniteScroll` in `@solid-primitives/pagination`: internal state uses `createServerSafeSignal`.
- `@solid-primitives/controlled-signal`: on the server an uncontrolled write lands in a plain override instead of the signal; reads and `onChange` behave as before.
- `@solid-primitives/date`: `createCountdown` is now a derived store (`createStore(fn, seed)`) instead of a render effect writing into one — the shape upstream prescribes.
- `@solid-primitives/masonry`: the one-shot signal that wired items to the layout memo is a plain variable.
- `@solid-primitives/pagination`: `createPagination` no longer reads its options at the top level of the calling component (`STRICT_READ_UNTRACKED`).
- `@solid-primitives/tween`: the effect's apply phase reads the current value with `untrack` (`STRICT_READ_UNTRACKED`).

`@solid-primitives/event-listener` and `@solid-primitives/pointer`: `eventListener`, `pointerPosition` and `pointerHover` now return a ref callback when called with props alone — `<button ref={eventListener(["click", onClick])} />`, `<div ref={pointerHover(setHovering)} />` — matching the `ref` directive shape Solid 2 replaced `use:` with. The two-argument `(el, props)` form still works.
