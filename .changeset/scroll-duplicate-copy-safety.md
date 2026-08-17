---
"@solid-primitives/scroll": patch
---

`createPreventScroll`'s active-instance stack and body-style ref-counts now live in a `globalRegistry` (keyed on `globalThis`, not module-scope bindings), so they stay correct even if the app's dependency graph ends up with more than one copy of this package installed — module-scope state would otherwise be split across copies, breaking the "topmost instance" ref-counting. Also replaced a hand-rolled `contains()` helper with the equivalent one already exported from `@solid-primitives/utils`. No API changes.
