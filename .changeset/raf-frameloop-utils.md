---
"@solid-primitives/raf": minor
---

Add `createCallbacksSet`, `useGlobalRAF` and `createScheduledLoop` (from #824 by Roy Eden), with fixes:

- `useGlobalRAF`: registering the same callback from two owners no longer lets one owner's `remove` or cleanup unregister the other's. Each registration is separate, so a callback added from two registrations runs once for each.
- `useGlobalRAF`: removing a callback that was never added no longer stops a loop that was started manually.
- `createCallbacksSet`: the returned callback is typed `(...args: Parameters<T>) => void`, since it returns nothing.
- `createRAF`: `stop()` no longer calls `cancelAnimationFrame` when no frame was requested.
