---
"@solid-primitives/trigger": major
---

Migrate to Solid.js v2.0 (beta.14)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

### `@solid-primitives/trigger`

- `isServer` now imported from `@solidjs/web` (not `solid-js/web`)
- `getListener` replaced by `getObserver` (renamed in Solid 2.0)
- Signal options updated: `internal: true` removed, `ownedWrite: true` added — allows `dirty()` and `dirtyAll()` to be called from within reactive scopes
- Added `test/server.test.ts` verifying SSR no-op behaviour for `createTrigger` and `createTriggerCache`
