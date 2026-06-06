---
"@solid-primitives/flux-store": major
---

Migrate to Solid.js v2.0 (beta.14)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.14` is now required.

**Store setter is now draft-first.** The `setState` function received in the `actions` callback no longer accepts path-style arguments. Instead, pass a draft mutator function:

```ts
// Before (Solid 1.x)
actions: setState => ({
  increment(by = 1) {
    setState("value", p => p + by);
  },
  reset() {
    setState("value", 0);
  },
})

// After (Solid 2.0)
actions: setState => ({
  increment(by = 1) {
    setState(s => { s.value += by; });
  },
  reset() {
    setState(s => { s.value = 0; });
  },
})
```

**`produce` helper removed.** Solid 2.0 stores use draft-first mutation by default, so `produce` is no longer necessary or available. Replace any `setState(produce(s => ...))` calls with `setState(s => ...)`.

**`batch` wrapper removed from `createAction`.** All writes in Solid 2.0 are auto-batched, so the explicit `batch()` wrap has been removed from `createAction`. Actions remain `untrack`ed.

**Import paths updated:** `createStore` and `StoreSetter` (formerly `SetStoreFunction`) are now imported from `solid-js` directly (store types were merged into the main package).
