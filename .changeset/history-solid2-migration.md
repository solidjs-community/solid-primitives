---
"@solid-primitives/history": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

### `@solid-primitives/history`

- `isServer` import moved from `solid-js/web` to `@solidjs/web`
- `batch()` removed from `undo()` and `redo()` — Solid 2.0 batches signal updates automatically; call `flush()` before reading `canUndo()`/`canRedo()` in tests or non-reactive (non-render) contexts
- Internal count signal uses `{ pureWrite: true }` for Solid 2.0 signal semantics
- `createMemo` initial state is now managed via an explicit `initialState` reference — Solid 2.0's `createMemo` passes `undefined` as `prev` on the first call, unlike Solid 1.x which passed the `init` argument
- Added SSR test coverage (`test/server.test.ts`)
