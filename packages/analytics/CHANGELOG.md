# @solid-primitives/analytics

## 1.1.0

### Minor Changes

- Use `@solid-primitives/page-utilities` for navigation blocking instead of a hand-rolled `beforeunload` listener, removing the `@solid-primitives/event-listener` dependency.
- `makeAnalyticsGuard` now returns a tuple `[(event: BeforeLeaveEvent) => void, () => void]` instead of `{ onBeforeLeave, cleanup }`, consistent with the `makeAnalytics` tuple convention.
- `createAnalyticsGuard` now returns `(event: BeforeLeaveEvent) => void` directly instead of `{ onBeforeLeave }`, allowing it to be passed straight to `useBeforeLeave`.
- Hard navigation (tab close, URL bar) now shows a browser confirmation dialog via `makePageLeave` rather than a fire-and-forget drain.

## 0.2.1

### Patch Changes

- f32f209: Update author email for David Di Biase.

## 0.2.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 0.1.6

### Patch Changes

- d23dd74: Add type exports for cjs

## 0.1.5

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 0.1.4

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 0.1.3

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 0.1.2

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 0.1.1

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 0.1.0

0.0.100
