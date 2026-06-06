---
"@solid-primitives/deep": major
---

Migrate to Solid.js v2.0 (beta.13)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.13` and `@solidjs/web@^2.0.0-beta.13` are now required.

### `@solid-primitives/deep`

- `isServer` now imported from `@solidjs/web` (not `solid-js/web`)
- Store imports (`createStore`, `reconcile`, `snapshot`) moved from `solid-js/store` to `solid-js`
- `unwrap` replaced by `snapshot` — returns a plain non-reactive copy of a store
- Store setters now use draft-first form: `setState(s => { s.prop = value; })` replaces path-based setters
- `createEffect` in examples updated to required split compute/apply form
- `trackStore` now correctly handles getters (subscribes to reactive deps accessed through getters) and rejects plain object wrappers around stores (`pojo: false` behavior preserved)
