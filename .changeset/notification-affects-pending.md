---
"@solid-primitives/notification": patch
---

`createNotificationPermission`'s `requestPermission` now calls `affects(permission)`, so `isPending(permission)` reads `true` for the duration of the request — the standard Solid 2.0 idiom for callers who don't want the existing bespoke `pending` accessor, which is unchanged and kept for backward compatibility.
