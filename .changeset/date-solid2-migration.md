---
"@solid-primitives/date": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

- `isServer` is now imported from `@solidjs/web` (not `solid-js/web`)
- `createStore` is now imported from `solid-js` (not `solid-js/store`)
- `@solid-primitives/timer` and `@solid-primitives/memo` dependencies removed; `TimeoutSource` type is now defined locally
- `createDateNow`: `createEffect` converted to split `(compute, apply)` form required by Solid 2.0; cleanup returned from apply phase instead of `onCleanup`
- `createCountdown`: `createComputed` (removed in Solid 2.0) replaced with `createRenderEffect(compute, apply)`
- `createDate`: `createWritableMemo` (removed in Solid 2.0) replaced with `createSignal(fn)` overload
