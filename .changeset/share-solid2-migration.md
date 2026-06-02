---
"@solid-primitives/share": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

### `@solid-primitives/share`

- `isServer` is now imported from `@solidjs/web` (was `solid-js/web`)
- `createWebShare` — internal `createEffect` converted to the split compute/apply pattern required by Solid 2.0; the `on` helper (removed in Solid 2.0) is no longer used
