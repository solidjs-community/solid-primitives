---
"@solid-primitives/bounds": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

### `@solid-primitives/bounds`

- `isServer` now imported from `@solidjs/web` (not `solid-js/web`)
- `onMount` replaced by `onSettled` for post-render initialization
- `sharedConfig.context` replaced by `sharedConfig.hydrating` for hydration detection
- Inline `ResizeObserver` usage with split `createEffect` (compute/apply) replaces the `@solid-primitives/resize-observer` dependency — the `@solid-primitives/resize-observer` package is no longer a dependency
- `@solid-primitives/static-store` dependency removed — bounds reactive object now built with `createMemo` directly for full Solid 2.0 type compatibility
