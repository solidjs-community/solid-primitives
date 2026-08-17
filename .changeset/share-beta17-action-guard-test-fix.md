---
"@solid-primitives/share": patch
---

Fixed test-suite breakage caused by a new Solid 2.0 beta.17 runtime guard; no API or behavior changes.

`@solidjs/signals@2.0.0-beta.17` added an `ACTION_CALLED_IN_OWNED_SCOPE` guard that throws when an `action()`-created function (like `createWebShare`'s `share`) is invoked while a reactive owner is active — actions are meant to be called from an event handler or other imperative scope, not from inside a component/computation. `createWebShare`'s tests called `share(...)` directly inside a `createRoot` callback, which now trips this guard. Updated the tests to invoke `share` via `runWithOwner(null, () => share(...))`, matching how a real DOM event handler calls it.
