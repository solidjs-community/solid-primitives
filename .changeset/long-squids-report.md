---
"@solid-primitives/set": minor
---

Fixes for ReactiveSet (#688):
- Iterators and `.forEach()` no longer track specific keys.
- Added support for `thisArg` as per `forEach` spec
- `super.clear()` now called before dirtying signals
- Uses new `dirtyAll` form trigger package
