---
"@solid-primitives/pagination": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

### `@solid-primitives/pagination`

- `isServer` now imported from `@solidjs/web` (not `solid-js/web`)
- `createPagination`: page clamping when pages count decreases is now implemented via a derived memo instead of `createComputed` (which was removed in Solid 2.0). The clamping is reactive and automatic.
- `createInfiniteScroll`: removed `createResource` dependency (removed in Solid 2.0). Fetching is now implemented with `createEffect` and a cancellation pattern. The `pages.loading` and `pages.error` resource properties are no longer available; use `end()` or wrap the fetcher to handle errors externally.
- `batch()` calls removed — Solid 2.0 batches updates automatically via microtasks. Tests require `flush()` after signal writes to observe committed values.
- All internal signals use `{ ownedWrite: true }` to allow setters to be called from reactive scopes and event handlers without triggering ownership warnings.
