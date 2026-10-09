---
"@solid-primitives/masonry": patch
---

Fix `ReferenceError` ("Cannot access 'layout' before initialization") when `mapElement` reads item accessors (`order()`, `margin()`, `column()`) while the items are first mapped, which `mapArray` now does eagerly.
