---
"@solid-primitives/video": minor
---

New package: `@solid-primitives/video`

Layered primitives for managing HTML video playback, built for Solid 2.0 (beta.14).

### `makeVideo`

Non-reactive base. Creates an `HTMLVideoElement` with optional event handlers and initial configuration (`autoPlay`, `loop`, `muted`, `preload`). Returns a `[player, cleanup]` tuple. No Solid owner required.

### `makeVideoPlayer`

Wraps `makeVideo` with imperative controls: `play`, `pause`, `seek`, `setVolume`, `setMuted`, `setPlaybackRate`, `setLoop`, and fullscreen (`requestFullscreen`, `exitFullscreen`, `toggleFullscreen`).

### `createVideo`

Reactive primitive covering essential playback state: `playing`/`setPlaying`, `currentTime`/`seek`, `ended`, `seeking`, `error` (`MediaError | null`), and `duration` (throws `NotReadyError` until metadata loads — integrates with `<Loading>`). Accepts a static or reactive `VideoSource` and optional `VideoOptions`.

### `createVideoPlayer`

Extends `createVideo` with the full control surface: `volume`/`setVolume`, `muted`/`setMuted`, `playbackRate`/`setPlaybackRate`, `loop`/`setLoop`, `buffered`, `readyState`, `videoWidth`, `videoHeight`, and `fullscreen`/fullscreen controls. Accepts `VideoControlsOptions` which adds `volume` and `playbackRate` initial values to `VideoOptions`.

### Design notes

`createVideo` and `createVideoPlayer` are composable — `createVideoPlayer` calls `createVideo` internally and layers additional `createEventListenerMap` bindings on the same player element. Choose the primitive that matches your needs; the non-reactive `make*` layer remains available when no Solid owner is present.
