---
"@solid-primitives/promise": major
---

Migrate to Solid.js v2.0 (beta.14)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.14` is now required.

### `@solid-primitives/promise`

- `createEffect` now uses the split compute/apply pattern required by Solid 2.0 — the reactive condition is evaluated in the compute phase and the resolve/dispose side-effect runs in the apply phase.
- Resolution of `until` is now deferred to after the reactive flush rather than being synchronous with the signal write. This matches the standard async nature of the returned `Promise`, so existing `await`-based usage is unaffected.
- Added `test/server.test.ts` to verify safe SSR behavior.
