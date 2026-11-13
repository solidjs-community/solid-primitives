---
"@solid-primitives/set": patch
"@solid-primitives/map": patch
---

Fix `ReactiveSet` / `ReactiveMap` iteration methods (`keys()`, `values()`, `entries()`, `[Symbol.iterator]()`) only subscribing once the iterator was first advanced (#830).

They were generator methods, so the `track()` call in their body did not run until the first `next()`. Creating an iterator inside a tracking scope and consuming it later (e.g. in an effect's apply phase or a `setTimeout`) registered no dependency. They are now plain methods that track immediately and return the native `Set`/`Map` iterator.

**Behavior change:** tracking now happens when the iterator is created, not when it is consumed. Calling `set.values()` inside a tracking scope subscribes to structural changes even if the iterator is never iterated. The returned iterators are now native `SetIterator`/`MapIterator` objects rather than generator objects.
