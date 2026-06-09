---
"@solid-primitives/spring": major
---

Migrate to Solid.js v2.0 (beta.14)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

### `@solid-primitives/spring`

- `isServer` is now imported from `@solidjs/web` (not `solid-js/web`)
- Internal animated value signal is created with `{ ownedWrite: true }`, allowing `set` (the spring setter) to be called from within reactive scopes such as effect apply phases
- `createDerivedSpring`: effect converted to split compute/apply form with `{ defer: true }` — avoids re-animating the initial value that was already set at construction time; apply phase correctly does not return the setter Promise
- Animation cleanup function is extracted explicitly (no longer relying on `onCleanup` return value)
- Tests updated to call `flush()` after signal writes and after RAF frame ticks, reflecting Solid 2.0's microtask-batched signal updates
