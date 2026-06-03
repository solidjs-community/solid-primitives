---
"@solid-primitives/selection": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

### `@solid-primitives/selection`

- `isServer` is now imported from `@solidjs/web` (was `solid-js/web`)
- `createEffect` for applying selection converted to the split compute/apply pattern required by Solid 2.0
- Event listeners are now registered directly with `onCleanup` rather than inside a `createEffect` with no reactive dependencies
- Internal signals now use `{ ownedWrite: true }` (via `INTERNAL_OPTIONS`) to allow `setSelection` to be called from within reactive scopes
- Added `test/server.test.ts` verifying SSR no-op behaviour for `createSelection`
- No changes to the public `createSelection` API or `HTMLSelection` type
