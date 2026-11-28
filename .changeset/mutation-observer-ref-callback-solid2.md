---
"@solid-primitives/mutation-observer": patch
---

Fix `mutationObserver(options, callback)` throwing `PRIMITIVE_IN_EFFECT_CALLBACK` when used as a JSX `ref` (#1143).

The observer was created inside the ref callback, where Solid 2 forbids `onSettled`, `onCleanup` and other primitives. It is now created once when `mutationObserver(...)` is evaluated (the component body) and the ref callback only calls `observe`. It disconnects with the owner of that call, and one factory value can be used on several elements.

`createMutationObserver` (and so `mutationObserver`) also mints a matching owner on the server, so the hydration ids of elements rendered after it stay aligned with the client.
