---
"@solid-primitives/video": minor
---

New package: `@solid-primitives/video`

Layered primitives for managing HTML video playback.

### `makeVideo`

Non-reactive base primitive. Creates an `HTMLVideoElement` with optional event handlers and returns a `[player, cleanup]` tuple. No Solid owner required.

### `makeVideoPlayer`

Wraps `makeVideo` with playback and fullscreen controls: `play`, `pause`, `seek`, `setVolume`, `setMuted`, `setPlaybackRate`, `requestFullscreen`, `exitFullscreen`, `toggleFullscreen`.

### `createVideo`

Reactive primitive that tracks all media state as signals: `playing`, `currentTime`, `volume`, `muted`, `playbackRate`, `ended`, `buffered`, `readyState`, `videoWidth`, `videoHeight`, `fullscreen`, and `duration`. The `duration` accessor throws `NotReadyError` until metadata loads, integrating naturally with `<Loading>`. Accepts a static or reactive `VideoSource`.
