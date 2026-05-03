---
"@solid-primitives/tween": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

### `@solid-primitives/tween`

- `isServer` now imported from `@solidjs/web` (not `solid-js/web`)
- `createEffect` updated to the two-argument compute/apply form required by Solid 2.0 — the removed `on()` helper is no longer used
- Cleanup (cancelling the in-flight `requestAnimationFrame`) is now returned from the apply function instead of calling `onCleanup`
- `current()` snapshot at tween start is now read inside `untrack()` to silence strict-mode warnings about untracked reads in apply callbacks
