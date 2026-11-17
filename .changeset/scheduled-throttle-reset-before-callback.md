---
"@solid-primitives/scheduled": patch
---

Fix `throttle` and `scheduleIdle` getting stuck after the callback throws. The "scheduled" flag was reset only after the callback returned, so one throw made every later call a no-op. A call made from inside the callback was also dropped for the same reason. `leadingAndTrailing` now also resets its state when the trailing call throws.
