---
"@solid-primitives/event-props": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.10` is now required.

### `@solid-primitives/event-props`

- Requires Solid.js v2 — signal writes from event handlers fire outside any reactive scope (as they always do from DOM events), consistent with Solid 2.0's owned-scope write restrictions
- Signal writes are microtask-batched in Solid 2.0; reads reflect the committed value after the next microtask or an explicit `flush()`
