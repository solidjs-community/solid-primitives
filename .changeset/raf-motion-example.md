---
"@solid-primitives/raf": patch
---

Correct the `createScheduledLoop` motion example: `frame.render` returns the scheduled callback, so it can be passed to `cancelFrame` directly.
