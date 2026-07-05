---
"@solid-primitives/pagination": major
---

Migrate to Solid.js v2.0 (beta.14)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

### `@solid-primitives/pagination`

- `isServer` now imported from `@solidjs/web` (not `solid-js/web`)
- `createPagination`: page clamping when pages count decreases is now implemented via a derived memo instead of `createComputed` (which was removed in Solid 2.0). The clamping is reactive and automatic.
- `createInfiniteScroll`: redesigned around per-page async reads instead of a flat accumulated array (resolves #795). `pages()` now returns the `{ content, fetching, error, retry }` bundle for every requested page, in order — feed it directly to `<For>`. `content` is a genuine async value, so it also works inside `<Loading>`/`<Errored>` boundaries for consumers who prefer that over reading `fetching`/`error` directly. Internally, pages are cached and disposed via `mapArray` (the same primitive `<For>` is built on), so shrinking `pageCount` now correctly disposes the pages that fall out of range — previously they leaked. `page`/`setPage`/`setPages`/`getPage` are removed in favor of `pageCount`/`setPageCount` and reading `pages()` directly; `end` no longer folds in errors (a failed page pauses auto-loading until retried via `retry()`, rather than permanently ending the scroll); added `reset()` to dispose every page and start over.
- `batch()` calls removed — Solid 2.0 batches updates automatically via microtasks. Tests require `flush()` after signal writes to observe committed values.
- All internal signals use `{ ownedWrite: true }` to allow setters to be called from reactive scopes and event handlers without triggering ownership warnings.
