---
"@solid-primitives/active-element": patch
---

Fix `focus()` throwing `CLEANUP_IN_FORBIDDEN_SCOPE` when used as a JSX `ref` callback (#1143).

Solid 2 forbids `onCleanup` in a `ref` callback, and `focus()` registered its listeners with `makeEventListener`, which calls it. The callback now uses plain `addEventListener` and returns its teardown. Each element keeps its own teardown, so one `focus()` value works on several elements, and all of them are also removed with the owner of the `focus()` call because the runtime ignores a ref callback's return value.
