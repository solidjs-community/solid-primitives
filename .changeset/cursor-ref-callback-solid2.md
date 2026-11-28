---
"@solid-primitives/cursor": patch
---

Fix `cursorRef` throwing `PRIMITIVE_IN_EFFECT_CALLBACK` when used as a JSX `ref` callback (#1143).

Solid 2 forbids creating effects inside a `ref` callback, and `cursorRef` created one there via `createElementCursor`. The effect is now created when `cursorRef(...)` is evaluated (the component body); the callback only registers the element and returns a teardown. The cursor is restored when the element unmounts or the owner is disposed, and one `cursorRef` value can be attached to several elements.

`cursorRef` also mints a matching owner on the server, so the hydration ids of elements rendered after it stay aligned with the client.
