# @solid-primitives/filesystem

## 3.0.0-next.0

### Major Changes

- 591095f: Migrate to Solid.js v2.0 (beta.14).

  Breaking changes:

  - `solid-js` peer dependency updated to `^2.0.0-beta.14`
  - `@solidjs/web` is now a required peer dependency
  - `isServer` is now imported from `@solidjs/web`
  - `createSyncFileSystem` and `createAsyncFileSystem` internal signals use `ownedWrite: true` to support writes from reactive scopes
  - `createAsyncFileSystem` no longer uses `createResource` — reads are backed by plain signals with manual `Promise`-based fetching, eliminating `ResourceActions` from the API
  - The `toPromise` helper in `tools.ts` uses the Solid 2.0 split `createEffect(compute, apply)` pattern

## 1.3.3

### Patch Changes

- f3f4784: fix: removing a file deletes its signal correctly

## 1.3.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.

## 1.3.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 1.3.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 1.2.2

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 1.2.1

### Patch Changes

- d23dd74: Add type exports for cjs

## 1.2.0

### Minor Changes

- 15a45a50: filesystem: support for webkitEntries

## 1.1.0

### Minor Changes

- 3525d165: filesystem: rsync utility

## 1.0.0

### Major Changes

- 51b5bec5: improve fail case (return null instead of mock)

## 0.0.101

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
