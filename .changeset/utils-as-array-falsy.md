---
"@solid-primitives/utils": patch
---

Fix `asArray` dropping falsy values that are not nullish: `asArray(0)`, `asArray("")` and `asArray(false)` returned `[]` instead of `[0]`, `[""]` and `[false]`.
