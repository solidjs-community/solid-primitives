---
"@solid-primitives/range": major
---

Migrate to Solid.js v2.0 (beta.13)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.13` and `@solidjs/web@^2.0.0-beta.13` are now required.

- `isServer` is now imported from `@solidjs/web` (was `solid-js/web`)
- `JSX` types are now imported from `@solidjs/web` (was `solid-js`)
- `indexRange` internal signals now use `ownedWrite: true` so they can be updated from inside reactive scopes (e.g. when `IndexRange` wraps in `createMemo`)
- `createEffect` usage in user code must use the split compute/apply form required by Solid 2.0 — see updated README examples
- Signal writes are now batched by default; call `flush()` after writing signals before reading the resulting mapped array
- `<Repeat>` is **deprecated** — Solid 2.0 ships an equivalent built-in `<Repeat count={n}>` in `@solidjs/web`. See the README for migration guidance. The `repeat` primitive continues to be supported for cases that require incremental child creation/disposal.
