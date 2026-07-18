# @solid-primitives/scheduled

## 2.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).

## 2.0.0-next.0

### Major Changes

- 6f5960d: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependency**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  ### `isServer` import source

  `isServer` is now sourced from `@solidjs/web` instead of `solid-js/web` (handled internally — no consumer change needed).

  ### `createScheduled` — `getListener` renamed to `getObserver`

  Uses `getObserver` from `solid-js` internally (Solid 2.0 rename of `getListener`). No consumer API change.

  ### `createScheduled` — `ownedWrite: true` on internal signal

  The internal invalidation signal now uses `{ ownedWrite: true }` to allow synchronous writes from within reactive computation scopes. This is required when using `leading`-edge schedules, which fire the invalidation callback synchronously from inside an effect's compute phase.

  ### `createScheduled` with `createEffect` — two-arg form required

  In Solid 2.0, `createEffect` requires a compute function and a separate apply function. The `scheduled()` accessor should be called in the compute phase:

  ```ts
  // ✅ Solid 2.0
  createEffect(
    () => {
      const value = count();
      const dirty = scheduled();
      return { value, dirty };
    },
    ({ value, dirty }) => {
      if (dirty) console.log("count", value);
    },
  );

  // ❌ Solid 1.x (no longer works)
  createEffect(() => {
    const value = count();
    if (scheduled()) console.log("count", value);
  });
  ```

  `createScheduled` continues to work with `createMemo` unchanged.

## 1.5.3

### Patch Changes

- f32f209: Update author email for David Di Biase.

## 1.5.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.

## 1.5.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 1.5.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 1.4.4

### Patch Changes

- 57a3078: Add check for typeof window, fallback to throttle if undefined

## 1.4.3

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 1.4.2

### Patch Changes

- d23dd74: Add type exports for cjs

## 1.4.1

### Patch Changes

- 722eeafb: Correct `leadingAndTrailing` timing

## 1.4.0

### Minor Changes

- a2c9ab03: Add new function `leadingAndTrailing`

## 1.3.2

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 1.3.1

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 1.3.0

### Minor Changes

- d05313a1: Add `createScheduled` primitive.

## 1.2.1

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 1.2.0

### Minor Changes

- 7a668126: Adds `scheduleIdle` scheduler based on `window.requestIdleCallback()`.

### Patch Changes

- 5b803dcd: Fix throttle blocking itself on clear, if the callback was not called.

## 1.1.0

### Minor Changes

- 8ddc147a: Disable scheduling on the server. The callbacks won't ever happen unles used with `leading`.

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 1.0.1

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 1.0.0

1.0.0

Initial release as a Stage-2 primitive.
