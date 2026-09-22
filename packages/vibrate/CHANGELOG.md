# @solid-primitives/vibrate

## 1.0.0-next.3

### Patch Changes

- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [7ee755d]
- Updated dependencies [638c530]
  - @solid-primitives/utils@7.0.0-next.5

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

- fb1e4ad: Add `@solid-primitives/vibrate` package (Stage 0)

  New primitives for device haptic feedback via the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API).

  - **`isVibrationSupported()`** — runtime check for Vibration API availability.
  - **`makeVibrate(pattern, options?)`** — non-reactive helper returning `[start, stop]`. Supports optional `interval` for repeating patterns. No-ops when the API is unavailable.
  - **`createVibrate(pattern, options?)`** — reactive primitive returning `{ vibrating, start, stop, supported }`. Accepts a reactive accessor for `pattern`: changing it while vibrating restarts automatically. Stops and cleans up on owner disposal.
  - **`frequencyToPattern(hz, dutyCycle?)`** — converts a frequency in Hz to a single-cycle `[onMs, offMs]` pattern.
  - **`makePulse(hz, options?)`** — non-reactive helper that vibrates continuously at `hz` cycles per second using a repeating chunk strategy.
  - **`createPulse(hz, options?)`** — reactive pulse primitive returning `{ pulsing, start, stop, supported }`. Accepts a reactive `hz` accessor: changing frequency while pulsing restarts immediately at the new rhythm.

  Peer dependencies: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14`.

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0
