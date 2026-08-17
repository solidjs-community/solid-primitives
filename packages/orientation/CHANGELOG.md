# @solid-primitives/orientation

## 1.0.0-next.2

### Patch Changes

- Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- Updated dependencies
  - @solid-primitives/utils@7.0.0-next.4

## 1.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/utils@7.0.0-next.2

## 1.0.0-next.0

### Major Changes

- 2372425: Add `@solid-primitives/orientation` package (Stage 0)

  New primitives for tracking screen orientation via the Screen Orientation API.

  - **`makeOrientation(onChange)`** — Non-reactive base primitive. Attaches a listener for `screen.orientation` `change` events (or the legacy `orientationchange` event as fallback) and returns a cleanup function. Does not fire on mount.
  - **`createOrientation()`** — Reactive primitive returning `angle` and `type` signal accessors, initialized to the current orientation and updated on every change. SSR-safe: returns static defaults (`angle: 0`, `type: "portrait-primary"`) on the server.

  Peer dependencies: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14`.

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0
