---
"@solid-primitives/virtual": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

### `@solid-primitives/virtual`

- **`createVirtualList`**: returns `[Accessor<VirtualState>, onScroll]` — the first element is now an Accessor that must be called to read `containerHeight`, `viewerTop`, and `visibleItems`.

- **`VirtualList` children**: the child render function now receives `(item: Accessor<T>, index: Accessor<number>)` — `item` is an Accessor and must be called as `item()` to get the value. This matches Solid 2.0's `<For>` component behavior.

- **`{ ownedWrite: true }`**: the internal scroll offset signal uses `ownedWrite` to allow writes from the `onScroll` event handler outside the owning reactive scope.
