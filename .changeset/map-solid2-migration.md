---
"@solid-primitives/map": major
---

Migrate to Solid.js v2.0 (beta.14)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

- `batch` is no longer used internally — Solid 2.0 auto-batches all writes, so multiple `dirty()` calls within a single `set`, `delete`, or `clear` are naturally coalesced
- Added `test/server.test.ts` to verify safe SSR behavior
