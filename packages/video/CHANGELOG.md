# @solid-primitives/video

## 1.0.0-next.1

### Minor Changes

- 7ec7507: Add `makeVideoFrameCallback` and `createVideoFrameCallback` — wrappers around [`HTMLVideoElement.requestVideoFrameCallback`](https://wicg.github.io/video-rvfc/) (resolves #365). The callback fires once per displayed video frame instead of once per display refresh, naturally stops while the video is paused, and receives frame metadata (`mediaTime`, `presentedFrames`, etc.) for syncing work to actual playback. `makeVideoFrameCallback` is non-reactive (no Solid owner required); `createVideoFrameCallback` wraps it in a signal and stops automatically `onCleanup`.

## 1.0.0-next.0

### Major Changes

- 98a57ab: New package: `@solid-primitives/video`

  Layered primitives for managing HTML video playback, built for Solid 2.0 (beta.14).

  ### `makeVideo`

  Non-reactive base. Creates an `HTMLVideoElement` with optional event handlers and initial configuration (`autoPlay`, `loop`, `muted`, `preload`). Returns a `[player, cleanup]` tuple. No Solid owner required.

  ### `makeVideoPlayer`

  Wraps `makeVideo` with imperative controls: `play`, `pause`, `seek`, `setVolume`, `setMuted`, `setPlaybackRate`, and `setLoop`.

  ### `createVideo`

  Reactive primitive covering essential playback state: `playing`/`setPlaying`, `currentTime`/`seek`, `ended`, `seeking`, `error` (`MediaError | null`), and `duration` (throws `NotReadyError` until metadata loads — integrates with `<Loading>`). Accepts a static or reactive `VideoSource` and optional `VideoOptions`.

  ### `createVideoPlayer`

  Extends `createVideo` with the full control surface: `volume`/`setVolume`, `muted`/`setMuted`, `playbackRate`/`setPlaybackRate`, `loop`/`setLoop`, `buffered`, `readyState`, `videoWidth`, and `videoHeight`. Accepts `VideoControlsOptions` which adds `volume` and `playbackRate` initial values to `VideoOptions`.

  ### Design notes

  `createVideo` and `createVideoPlayer` are composable — `createVideoPlayer` calls `createVideo` internally and layers additional `createEventListenerMap` bindings on the same player element. Choose the primitive that matches your needs; the non-reactive `make*` layer remains available when no Solid owner is present.

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0
  - @solid-primitives/event-listener@3.0.0-next.0
