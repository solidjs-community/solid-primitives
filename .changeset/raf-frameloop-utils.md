---
"@solid-primitives/raf": minor
---

Add `createCallbacksSet`, `useGlobalRAF` and `createScheduledLoop`, ported to Solid 2.0 from the original work by Roy Eden (@royeden) in #824.

- `createCallbacksSet` combines several callbacks into one, so they can share a single `createRAF` loop.
- `useGlobalRAF` runs callbacks on one shared `requestAnimationFrame` loop held in a singleton root.
- `createScheduledLoop` gives external frameloop schedulers (e.g. motion's `frame`) the `[running, start, stop]` shape of `createRAF`.

Fixes in `createRAF`: `stop()` no longer calls `cancelAnimationFrame(0)` when no frame was requested, and calling `start()` twice before a flush no longer starts two loops.
