---
"@solid-primitives/lifecycle": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

- `isServer` is now imported from `@solidjs/web` (was `solid-js/web`)
- `onMount` replaced with `onSettled` — `createIsMounted` now schedules its signal update after the owner settles
- `getListener` replaced with `getObserver` — `isHydrated` uses `getObserver` to detect reactive context
- `sharedConfig.context` replaced with `sharedConfig.hydrating` — `isHydrated` now reads the boolean `hydrating` flag
- `renderToString` in server tests now imported from `@solidjs/web` (was `solid-js/web`)

No changes to the public API: `createIsMounted`, `isHydrated`, and `onElementConnect` signatures are unchanged.
