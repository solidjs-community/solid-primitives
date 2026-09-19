# @solid-primitives/video

## 1.0.0-next.4

### Patch Changes

- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [7ee755d]
- Updated dependencies [638c530]
  - @solid-primitives/utils@7.0.0-next.5
  - @solid-primitives/event-listener@3.0.0-next.6

## 1.0.0-next.3

### Patch Changes

- Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- Updated dependencies
  - @solid-primitives/event-listener@3.0.0-next.3
  - @solid-primitives/utils@7.0.0-next.4

## 1.0.0-next.2

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/event-listener@3.0.0-next.2
  - @solid-primitives/utils@7.0.0-next.2

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
