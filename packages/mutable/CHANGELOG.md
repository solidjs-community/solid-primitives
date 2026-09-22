# @solid-primitives/mutable

## 3.0.0-next.3

### Patch Changes

- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

## 3.0.0-next.2

### Patch Changes

- Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.

## 3.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).

## 3.0.0-next.0

### Major Changes

- 981dd12: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  ### `modifyMutable` API change

  The modifier function now receives the **mutable proxy** directly instead of the unwrapped raw object:

  ```ts
  // Before (v1) — modifier received the raw unwrapped object
  modifyMutable(state, reconcile({ firstName: "Jake" }));
  modifyMutable(
    state,
    produce(s => {
      s.firstName = "Jake";
    }),
  );

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

## 1.1.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 1.1.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 1.0.2

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 1.0.1

### Patch Changes

- d23dd74: Add type exports for cjs
