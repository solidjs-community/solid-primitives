---
"@solid-primitives/resize-observer": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

### `@solid-primitives/resize-observer`

- `isServer` now imported from `@solidjs/web` (not `solid-js/web`)
- `createResizeObserver`: internal `createEffect` converted to the Solid 2.0 split compute/apply pattern
- `createElementSize`: internal `createEffect` converted to split compute/apply pattern; element cleanup (`unobserve`) is returned from apply phase instead of using `onCleanup`
- `createElementSize`: `sharedConfig.context` replaced with `sharedConfig.hydrating` for hydration detection
- `createStore` setter in consuming code now requires a function argument (Solid 2.0 store API change)
