---
"@solid-primitives/mouse": major
---

Migrate to Solid.js v2.0 (beta.13)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.13` and `@solidjs/web@^2.0.0-beta.13` are now required.

### `@solid-primitives/mouse`

- `isServer` now imported from `@solidjs/web` (not `solid-js/web`)
- `onMount` replaced by `onSettled` for post-render initialization
- `sharedConfig.context` replaced by `sharedConfig.hydrating` for hydration detection
- `createEffect` migrated to split compute/apply form — reactive target re-attachment now uses explicit cleanup return from the apply phase
- Added `test/server.test.ts` with SSR safety coverage for `createMousePosition` and `createPositionToElement`
