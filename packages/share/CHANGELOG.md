# @solid-primitives/share

## 4.0.0-next.2

### Patch Changes

- 20afdb7: Fixed test-suite breakage caused by a new Solid 2.0 beta.17 runtime guard; no API or behavior changes.

  `@solidjs/signals@2.0.0-beta.17` added an `ACTION_CALLED_IN_OWNED_SCOPE` guard that throws when an `action()`-created function (like `createWebShare`'s `share`) is invoked while a reactive owner is active — actions are meant to be called from an event handler or other imperative scope, not from inside a component/computation. `createWebShare`'s tests called `share(...)` directly inside a `createRoot` callback, which now trips this guard. Updated the tests to invoke `share` via `runWithOwner(null, () => share(...))`, matching how a real DOM event handler calls it.

## 4.0.0-next.1

### Patch Changes

- 5fc4efa: Fix named imports breaking under Rolldown (Vite 8+ / Storybook 10.4.6+) bundlers.

  These packages re-export their public API via `export * from "./x.js"` barrels. Rollup resolves named imports through these at link time, but Rolldown's static analysis doesn't reliably follow `export *` for named-export resolution, causing errors like:

  ```
  "createEventListener" is not exported by "@solid-primitives/event-listener/dist/index.js"
  ```

  The build now also emits explicit `export { name } from "./x.js"` lines for every runtime export reachable through a barrel's `export *`, derived automatically from each submodule's compiled output — so `dist/` is bundler-agnostic regardless of how a given tool resolves star re-exports.

## 4.0.0-next.0

### Major Changes

- f68a71f: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  ### `@solid-primitives/share`
  - `isServer` is now imported from `@solidjs/web` (was `solid-js/web`)
  - `createWebShare` — internal `createEffect` converted to the split compute/apply pattern required by Solid 2.0; the `on` helper (removed in Solid 2.0) is no longer used

## 2.2.4

### Patch Changes

- f32f209: Update author email for David Di Biase.

## 2.2.3

### Patch Changes

- f5abdc3: @solid-primitives/graphql: Fix a build issue occurring during the bundling process.
  @solid-primitives/share: Fix a typo for Facebook Messenger

## 2.2.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.

## 2.2.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 2.2.0

### Minor Changes

- 00822cc: Added Bluesky and X networks

## 2.1.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 2.0.6

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 2.0.5

### Patch Changes

- d23dd74: Add type exports for cjs

## 2.0.4

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 2.0.3

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 2.0.2

### Patch Changes

- 646f576a: Add `createHydrateSignal` primitive to utils and fix hydration issues

## 2.0.1

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 2.0.0

### Major Changes

- aa2fcb52: Add `makeWebShare` and `createWebShare` primitives. Rename network variables to UPPERCASE. Make `createSocialShare` a named export, instead of default.

## 1.0.3

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 0.1.1

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 0.1.0

0.0.100

Initial release as a Stage-0 primitive.

0.0.105

Added CJS and SSR support.

0.0.150

Updated to Solid 1.3

1.0.1

Updated to Solid 1.5.5, corrected/simplified exports and types. Updated README with docs and definition.

1.0.2

Ensured that the package is SSR friendly.
