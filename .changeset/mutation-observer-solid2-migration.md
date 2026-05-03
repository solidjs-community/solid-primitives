---
"@solid-primitives/mutation-observer": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

### `@solid-primitives/mutation-observer`

- `onMount` replaced with `onSettled` — observation starts after the component fully settles (async-aware) rather than after initial synchronous render
- `isServer` now imported from `@solidjs/web`; `isSupported` returns `false` on the server without touching `window`
- `start()` is a no-op on the server, guarding against missing DOM globals in Node.js
- Added `test/server.test.ts` to verify safe SSR behavior
