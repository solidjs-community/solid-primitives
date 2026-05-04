---
"@solid-primitives/cursor": major
---

Migrate to Solid.js v2.0 and add new primitives

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

- `isServer` now imported from `@solidjs/web` (not `solid-js/web`)
- `createElementCursor` and `createBodyCursor` updated to the split compute/apply effect pattern required by Solid 2.0 — cleanup is returned from the apply phase instead of using `onCleanup`

## New Exports

- `makeBodyCursor(cursor)` — sets cursor on body immediately, returns a cleanup function
- `makeElementCursor(target, cursor)` — sets cursor on an element immediately, returns a cleanup function
- `createDragCursor(target, options?)` — reactively sets `"grab"` on a target element and switches to `"grabbing"` on the body during pointer drag
- `cursorRef(cursor)` — ref factory for inline JSX use: `<div ref={cursorRef("pointer")}>`
