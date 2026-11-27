---
"@solid-primitives/form": patch
---

Fix `form.ref` and `form.bind()` throwing `CLEANUP_IN_FORBIDDEN_SCOPE` (and `PRIMITIVE_IN_EFFECT_CALLBACK`) when used as JSX `ref` callbacks (#1143).

Solid 2 runs a `ref` callback in a restricted context where `onCleanup` and creating roots, memos or effects are forbidden. `ref` and `bind` registered their listeners with `makeEventListener` (which calls `onCleanup`) and `bind` created its DOM-sync effect inside the callback. In a hydrated app the throw aborted hydration, so the submit handler was never attached and a native GET submission put the fields, including passwords, into the URL.

Listeners are now plain `addEventListener` calls inside the ref callback, which still returns its cleanup. The field → DOM sync effect is created when `form.bind("name")` is evaluated (the component body), and the listeners are also torn down with the owner of `createForm` / `bind()`, because the runtime ignores a ref callback's return value. The unused `@solid-primitives/event-listener` dependency is removed.
