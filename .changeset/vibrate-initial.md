---
"@solid-primitives/vibrate": minor
---

Add `@solid-primitives/vibrate` package (Stage 0)

New primitives for device haptic feedback via the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API).

- **`isVibrationSupported()`** — runtime check for Vibration API availability.
- **`makeVibrate(pattern, options?)`** — non-reactive helper returning `[start, stop]`. Supports optional `interval` for repeating patterns. No-ops when the API is unavailable.
- **`createVibrate(pattern, options?)`** — reactive primitive returning `{ vibrating, start, stop, supported }`. Accepts a reactive accessor for `pattern`: changing it while vibrating restarts automatically. Stops and cleans up on owner disposal.
- **`frequencyToPattern(hz, dutyCycle?)`** — converts a frequency in Hz to a single-cycle `[onMs, offMs]` pattern.
- **`makePulse(hz, options?)`** — non-reactive helper that vibrates continuously at `hz` cycles per second using a repeating chunk strategy.
- **`createPulse(hz, options?)`** — reactive pulse primitive returning `{ pulsing, start, stop, supported }`. Accepts a reactive `hz` accessor: changing frequency while pulsing restarts immediately at the new rhythm.

Peer dependencies: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10`.
