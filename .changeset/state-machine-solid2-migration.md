---
"@solid-primitives/state-machine": major
---

Migrate to Solid.js v2.0 (beta.13)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.13` is now required.

- Signal writes are now batched by default; call `flush()` from `solid-js` after calling `state.to.*()` before reading reactive state in tests or synchronous non-reactive code.
- `@solid-primitives/utils` is now a runtime dependency (used for `INTERNAL_OPTIONS` / `ownedWrite` signal option).
- State callbacks called during machine initialization that immediately transition to another state will now require a `flush()` before reading the resulting state.
