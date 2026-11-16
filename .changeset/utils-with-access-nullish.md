---
"@solid-primitives/utils": patch
---

Fix `withAccess` calling its callback with `undefined` or `null`. The check was `typeof _value != null`, which is always true, so the value was never skipped.
