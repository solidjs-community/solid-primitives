---
"@solid-primitives/media": patch
---

Fix `createBreakpoints` throwing `CLEANUP_IN_FORBIDDEN_SCOPE` during hydration when `watchChange` is enabled: media query change listeners are now registered in the owner scope instead of inside `onSettled`.
