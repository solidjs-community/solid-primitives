---
"@solid-primitives/i18n": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.10` is now required.

### `@solid-primitives/i18n`

- `createResource` is removed in Solid 2.0 — use `createMemo` with an async function for dynamic dictionary loading, or a synchronous `createMemo` for static dictionaries
- `Suspense` is replaced by `Loading` from `solid-js` for wrapping async dictionary reads
- `useTransition` is removed — use `isPending()` from `solid-js` to observe transition state
- `onMount` replaced by `onSettled` for post-hydration lifecycle callbacks
- `createEffect` now requires the split compute/apply form: `createEffect(compute, effect)` — single-argument usage is no longer supported
- The `jsx` entry in test dictionaries no longer returns JSX elements; the test helper `setup.tsx` is renamed to `setup.ts` with plain object returns
