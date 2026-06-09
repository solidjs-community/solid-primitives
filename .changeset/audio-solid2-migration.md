---
"@solid-primitives/audio": major
---

Migrate to Solid.js v2.0 (beta.14)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

### `@solid-primitives/audio`

- `isServer` now imported from `@solidjs/web`
- Signals use `ownedWrite: true` option for derived writable signals
- `createEffect` uses the split compute/apply form for reactive source changes
- `duration` accessor throws `NotReadyError` until audio metadata loads, integrating with `<Loading>`. Previously returned `NaN` before load; resets to pending whenever the source changes.

  ```tsx
  // Before (Solid 1.x): duration() returned NaN before metadata loaded
  // After (Solid 2.0): wrap in <Loading> to handle the pending state
  <Loading fallback="Loading...">
    <span>{audio.duration()}s</span>
  </Loading>
  ```

- SSR: `duration()` throws `NotReadyError` on the server (was previously `NaN`).
- Added `test/server.test.ts` to verify safe SSR behavior
