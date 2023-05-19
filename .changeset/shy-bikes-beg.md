---
"@solid-primitives/deep": minor
---

- Renames `deepTrack` to `trackDeep` to make it easier to provide similar tracking functions differentiated by the suffix.
- Slightly improves the performance of `trackDeep` by iterating with `for of` and reusing value type checks.
- Adds a much more performant alternative - `trackStore` which utilizes memoization and the `$TRACK` symbol to reduce iterating over proxies and traversing unchanged objects.
