---
"@solid-primitives/scheduled": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

### `isServer` import source

`isServer` is now sourced from `@solidjs/web` instead of `solid-js/web` (handled internally — no consumer change needed).

### `createScheduled` — `getListener` renamed to `getObserver`

Uses `getObserver` from `solid-js` internally (Solid 2.0 rename of `getListener`). No consumer API change.

### `createScheduled` — `ownedWrite: true` on internal signal

The internal invalidation signal now uses `{ ownedWrite: true }` to allow synchronous writes from within reactive computation scopes. This is required when using `leading`-edge schedules, which fire the invalidation callback synchronously from inside an effect's compute phase.

### `createScheduled` with `createEffect` — two-arg form required

In Solid 2.0, `createEffect` requires a compute function and a separate apply function. The `scheduled()` accessor should be called in the compute phase:

```ts
// ✅ Solid 2.0
createEffect(
  () => { const value = count(); const dirty = scheduled(); return { value, dirty }; },
  ({ value, dirty }) => { if (dirty) console.log("count", value); },
);

// ❌ Solid 1.x (no longer works)
createEffect(() => {
  const value = count();
  if (scheduled()) console.log("count", value);
});
```

`createScheduled` continues to work with `createMemo` unchanged.
