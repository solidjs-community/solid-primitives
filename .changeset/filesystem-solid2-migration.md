---
"@solid-primitives/filesystem": major
---

Migrate to Solid.js v2.0 (beta.13).

Breaking changes:
- `solid-js` peer dependency updated to `^2.0.0-beta.13`
- `@solidjs/web` is now a required peer dependency
- `isServer` is now imported from `@solidjs/web`
- `createSyncFileSystem` and `createAsyncFileSystem` internal signals use `ownedWrite: true` to support writes from reactive scopes
- `createAsyncFileSystem` no longer uses `createResource` — reads are backed by plain signals with manual `Promise`-based fetching, eliminating `ResourceActions` from the API
- The `toPromise` helper in `tools.ts` uses the Solid 2.0 split `createEffect(compute, apply)` pattern
