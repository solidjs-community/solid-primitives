---
"@solid-primitives/audio": major
---

Migrate to Solid.js v2.0 (beta.13)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.13` and `@solidjs/web@^2.0.0-beta.13` are now required.

### `@solid-primitives/audio`

- `isServer` now imported from `@solidjs/web`
- Signals use `ownedWrite: true` option for derived writable signals
- `createEffect` uses the split compute/apply form for reactive source changes
- `duration` accessor throws `NotReadyError` until audio metadata loads, integrating with `<Loading>`
- Added `test/server.test.ts` to verify safe SSR behavior
