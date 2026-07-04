# @solid-primitives/analytics

## 2.0.0-next.0

### Major Changes

- 5b99671: Redesign for Solid.js v2.0 (beta.14) with a queue-based plugin pipeline

  ## Breaking Changes

  **Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  The previous `createAnalytics(handlers)` default export and `EventType` / `TrackHandler` types have been replaced with a richer API:

  - **`makeAnalytics(plugins, options?)`** — non-reactive base primitive returning `[controls, cleanup]`
  - **`createAnalytics(plugins, options?)`** — reactive primitive returning controls plus `initialized` and `pendingCount` signals

  ### Plugin format

  Plugins follow the [`analytics`](https://www.npmjs.com/package/analytics) npm package interface (`name`, `initialize`, `loaded`, `page`, `track`, `identify`), so any plugin from the [analytics plugin catalogue](https://www.npmjs.com/package/analytics#analytic-plugins) works directly — install it separately and pass it in.

  No first-party plugins are bundled in this package.

  ### Event queue

  Events fired before plugins finish initializing are buffered in a bounded FIFO queue and replayed automatically once all plugins report ready. The queue limit and poll interval are configurable via `AnalyticsOptions`.

  ### Migration

  ```ts
  // Before (v0.x)
  import createAnalytics, { EventType } from "@solid-primitives/analytics";
  const track = createAnalytics([myHandler]);
  track(EventType.Event, { category: "ui", action: "click" });

  // After (v1.x) — use any plugin from https://www.npmjs.com/package/analytics#analytic-plugins
  import { createAnalytics } from "@solid-primitives/analytics";
  import googleAnalytics from "@analytics/google-analytics";

  const analytics = createAnalytics([googleAnalytics({ measurementId: "G-xxx" })]);
  analytics.track("click", { category: "ui" });
  ```

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
