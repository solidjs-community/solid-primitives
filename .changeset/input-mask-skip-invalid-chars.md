---
"@solid-primitives/input-mask": patch
---

Fix array and string masks when two or more invalid characters sit before a valid one: the position was moved back, so `"9-9-9"` turned `"1ab2cd3"` into `"1--2"` instead of `"1-2-3"`.
