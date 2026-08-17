---
"@solid-primitives/styles": major
---

Migrate to Solid.js v2.0 (beta.14)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

### `@solid-primitives/styles`

- `isServer` now imported from `@solidjs/web` (not `solid-js/web`)
- Requires Solid.js v2 — signal writes from browser callbacks (e.g. ResizeObserver) are microtask-batched; reads reflect the new value immediately but effects are deferred until the next microtask or `flush()`
