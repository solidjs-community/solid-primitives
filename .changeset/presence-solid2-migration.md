---
"@solid-primitives/presence": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.10` is now required.

### `@solid-primitives/presence`

- `createEffect` calls converted to the split compute/apply pattern required by Solid 2.0; cleanup is returned from the apply phase instead of calling `onCleanup`
- Internal signals now use `{ ownedWrite: true }` to allow writes from the effect apply phases
- No changes to the public `createPresence` API or `PresenceResult` type
