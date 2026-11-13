---
"@solid-primitives/storage": patch
---

`multiplexStorage`: with asynchronous storages, `getItem`/`key` now resolve to the first storage (in order) that returns a value instead of whichever storage answers first, so a fast storage without a value no longer hides a slower one that has it. A rejecting storage is skipped; the first rejection is only rethrown if no storage returns a value. (#799)
