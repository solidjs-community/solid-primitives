---
"@solid-primitives/script-loader": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

### `@solid-primitives/script-loader`

- `isServer` and `spread` now imported from `@solidjs/web` (not `solid-js/web`)
- `ComponentProps` and `JSX` types now sourced from `@solidjs/web` for correct intrinsic element resolution
- `splitProps` (removed in Solid 2.0) replaced with plain object extraction
- Static script attributes applied via `assign` synchronously before reactive src tracking; this means attributes like `type` and `async` are set before the script is appended to the document, which is the correct order for browser loading
- `createRenderEffect` converted to the split compute/apply pattern required by Solid 2.0; src accessor is tracked in the compute phase and the DOM update applied in the apply phase
