---
"@solid-primitives/broadcast-channel": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

- `isServer` is now imported from `@solidjs/web` (was `solid-js/web`)
- `createEffect` usage follows the split compute/apply pattern required by Solid 2.0 — single-argument `createEffect` is no longer supported
