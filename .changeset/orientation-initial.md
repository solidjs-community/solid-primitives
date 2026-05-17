---
"@solid-primitives/orientation": minor
---

Add `@solid-primitives/orientation` package (Stage 0)

New primitives for tracking screen orientation via the Screen Orientation API.

- **`makeOrientation(onChange)`** — Non-reactive base primitive. Attaches a listener for `screen.orientation` `change` events (or the legacy `orientationchange` event as fallback) and returns a cleanup function. Does not fire on mount.
- **`createOrientation()`** — Reactive primitive returning `angle` and `type` signal accessors, initialized to the current orientation and updated on every change. SSR-safe: returns static defaults (`angle: 0`, `type: "portrait-primary"`) on the server.

Peer dependencies: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10`.
