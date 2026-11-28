---
"@solid-primitives/scheduled": minor
---

Add `createDebounced` and `createThrottled` derived accessors. They are built on Solid 2's `createDeferred`, so a held-back value stays visible while `isPending()` reports the wait, and the landing participates in the normal reactive graph. Both support `leading` / `trailing` edge options; `createDebounced` also supports `maxWait`.
