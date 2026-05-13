---
"@solid-primitives/masonry": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.10` is now required.

### `@solid-primitives/masonry`

- `mapArray` callback signature changed: the first argument is now `Accessor<T>` (not `T` directly). The implementation now calls `source()` internally, so the public API is unchanged.
- `createMemo` no longer accepts a separate initial-value argument. The `getColumns` memo options (`equals`) are now passed as the second argument directly.
- `createSignal<VoidFunction | undefined>` with `ownedWrite: true` — allows `createMasonry` to be called from within reactive scopes (component bodies, `createRoot`, effects) without throwing `SIGNAL_WRITE_IN_OWNED_SCOPE`.
- Signal writes inside tests moved outside `createRoot` scope to match Solid 2.0 owned-scope write rules.
- `flush()` added after reactive signal writes in tests to commit pending values before assertions.
