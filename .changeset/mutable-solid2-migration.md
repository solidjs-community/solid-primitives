---
"@solid-primitives/mutable": major
---

Migrate to Solid.js v2.0 (beta.14)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

### `modifyMutable` API change

The modifier function now receives the **mutable proxy** directly instead of the unwrapped raw object:

```ts
// Before (v1) — modifier received the raw unwrapped object
modifyMutable(state, reconcile({ firstName: "Jake" }));
modifyMutable(state, produce(s => { s.firstName = "Jake"; }));

// After (v2) — modifier receives the proxy; mutate it directly
modifyMutable(state, s => {
  s.firstName = "Jake";
});
```

`produce` no longer exists in Solid 2.0 — store setters are now draft-first by default, so plain mutation functions replace it. `reconcile` still exists but is now imported from `solid-js` directly (not `solid-js/store`).

### `solid-js/store` removed

`solid-js/store` no longer exists as a separate entrypoint. Store utilities (`reconcile`, `snapshot`, etc.) are now exported from `solid-js` directly.

### Auto-batching

Explicit `batch()` calls are no longer needed — all signal writes in Solid 2.0 are automatically batched to the next microtask. Call `flush()` (from `solid-js`) in tests when you need synchronous application of pending writes.

### Non-reactive reads reflect writes immediately

Reading a mutable property outside a reactive context (effects, memos, JSX) always returns the most current value without needing `flush()`.

## Internal changes

- Imports migrated: `solid-js/web` → `@solidjs/web`, store APIs → `solid-js`
- `getListener` renamed to `getObserver` (Solid 2.0 API)
- `batch()` removed throughout — Solid 2.0 auto-batches all writes
- Signal creation uses `{ ownedWrite: true }` to allow writes from reactive scopes
- `isWrappable` is now a local implementation (plain objects + arrays only; excludes frozen objects and class instances)
