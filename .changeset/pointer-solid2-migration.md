---
"@solid-primitives/pointer": major
---

Migrate to Solid.js v2.0 (beta.14)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

- `isServer` is now imported from `@solidjs/web` (was `solid-js/web`)
- `JSX` type is now imported from `@solidjs/web` (was `solid-js`) — `JSX.Element` moved to the web renderer package
- Added `test/server.test.ts` with SSR safety coverage for all primitives
