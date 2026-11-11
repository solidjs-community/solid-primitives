---
"@solid-primitives/storage": minor
---

Add a `merge` option to `makePersisted` that applies stored data on top of the initial value instead of replacing it, so keys added to a store's initial value later keep their defaults when older persisted data is loaded (#748). `merge: true` deep-merges plain objects (arrays and other values are replaced); a function `(stored, initial) => value` allows custom merging. Default behavior is unchanged.

If the initial value is still pending (an async or optimistic signal), there are no defaults yet: `merge: true` uses the stored data as is, and a custom merge function receives `undefined` as the initial value.
