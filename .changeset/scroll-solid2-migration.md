---
"@solid-primitives/scroll": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

### `@solid-primitives/scroll`

- `isServer` now imported from `@solidjs/web` (not `solid-js/web`)
- `onMount` replaced with `onSettled` for post-render position refresh
- `sharedConfig.context` replaced with `sharedConfig.hydrating` for hydration detection
- Internal signal pattern replaced: Solid 2.0's `createSignal(fn)` creates a derived signal rather than storing a function value; now uses a version counter to drive memo re-evaluation on scroll events
- Signal uses `{ ownedWrite: true }` to allow writes from DOM event handlers within reactive scopes
- Tests updated: `createComputed` removed (no longer in Solid 2.0), replaced with direct reactive reads and `flush()` for synchronous assertions; `createSignal` in tests uses `{ ownedWrite: true }`
- README: `onMount` example updated to `onSettled`
