# @solid-primitives/vibrate

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
