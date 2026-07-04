# @solid-primitives/selection

## 1.0.0-next.0

### Major Changes

- 479ba79: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  ### `@solid-primitives/selection`

  - `isServer` is now imported from `@solidjs/web` (was `solid-js/web`)
  - `createEffect` for applying selection converted to the split compute/apply pattern required by Solid 2.0
  - Event listeners are now registered directly with `onCleanup` rather than inside a `createEffect` with no reactive dependencies
  - Internal signals now use `{ ownedWrite: true }` (via `INTERNAL_OPTIONS`) to allow `setSelection` to be called from within reactive scopes
  - Added `test/server.test.ts` verifying SSR no-op behaviour for `createSelection`
  - No changes to the public `createSelection` API or `HTMLSelection` type

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0

## 0.1.3

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.

## 0.1.2

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 0.1.1

### Patch Changes

- 4ddea69: fix: selection contenteditable node detection

## 0.1.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 0.0.8

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.0.7

### Patch Changes

- d23dd74: Add type exports for cjs

## 0.0.6

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 0.0.5

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 0.0.4

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 0.0.3

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 0.0.2

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 0.0.1

0.0.100

Initial release as a Stage-0 primitive.
