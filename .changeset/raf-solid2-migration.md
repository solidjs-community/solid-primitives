---
"@solid-primitives/raf": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

### `@solid-primitives/raf`

- `isServer` now imported from `@solidjs/web` (not `solid-js/web`)
- `createRAF`: `running` signal created with `{ ownedWrite: true }` to allow `start()`/`stop()` to be called from within reactive scopes
- Added `test/server.test.ts` verifying SSR no-op behaviour for `createRAF`, `targetFPS`, and `createMs`
