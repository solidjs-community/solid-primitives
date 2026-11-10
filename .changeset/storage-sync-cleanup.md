---
"@solid-primitives/storage": patch
---

Return an explicit disposer as the fourth value from `makePersisted` to unsubscribe sync listeners and cancel pending initialization. Preserve writes made before deferred initialization.
