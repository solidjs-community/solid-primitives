---
"@solid-primitives/keyed": major
---

Migrate to Solid.js v2.0 (beta.13)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.13` and `@solidjs/web@^2.0.0-beta.13` are now required.

- `isServer` is now imported from `@solidjs/web` (was `solid-js/web`)
- `JSX` type is now imported from `@solidjs/web` (was `solid-js`)
- `Rerun` props: `on` type changed from `AccessorArray<S> | Accessor<S>` to `Accessor<S>[] | Accessor<S>` (`AccessorArray` was removed from `solid-js`)
- Internal signals in `keyArray` now use `ownedWrite: true` to satisfy Solid 2.0's owned-scope write restrictions
