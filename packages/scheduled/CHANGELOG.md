# @solid-primitives/scheduled

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
