---
"@solid-primitives/controlled-props": patch
---

`BoolProp`, `NumberProp`, `RangeProp`, and `StringProp` are now typed `VoidComponent` instead of `Component`, since none of them accept or render children. Type-only change, no behavior difference.
