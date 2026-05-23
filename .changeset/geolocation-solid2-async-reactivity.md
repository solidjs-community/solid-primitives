---
"@solid-primitives/geolocation": minor
---

Adapt geolocation primitives for Solid 2.0 async reactivity.

## `createGeolocationWatcher` — breaking changes

**Pending state via `NotReadyError` (replaces `undefined`):** `location()` now throws `NotReadyError` until the first GPS fix arrives, integrating with `<Loading>` boundaries. Previously it returned `undefined` (which was cast away) using the Solid 1.x `<Suspense>` suspension mechanism.

```tsx
// Before — undefined was returned silently (Solid 1.x Suspense behavior)
const { location } = createGeolocationWatcher(true);
location() // undefined before first fix

// After — throws NotReadyError (Solid 2.0 <Loading> pattern)
const { location } = createGeolocationWatcher(true);
location() // throws NotReadyError before first fix

// Integrate with <Loading>:
<Loading fallback="Acquiring GPS fix...">
  <Map lat={location().latitude} lng={location().longitude} />
</Loading>
```

**Reactive options now correctly restart the watcher:** Previously `options` was read inside the effect handler (untracked), so changing a reactive `options` accessor had no effect. The effect source now tracks both `enabled` and `options` — when `options` changes while the watcher is active, the watcher is closed and reopened with the new options.

## SSR stubs — breaking changes

`createGeolocation` and `createGeolocationWatcher` now throw `NotReadyError` on the server instead of a plain `Error`. This means SSR renders show the `<Loading>` fallback (pending state) rather than hitting the `<Errored>` boundary, which is the correct behavior for client-side-only APIs that will hydrate and resolve client-side.
