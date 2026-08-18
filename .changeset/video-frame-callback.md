---
"@solid-primitives/video": minor
---

Add `makeVideoFrameCallback` and `createVideoFrameCallback` — wrappers around [`HTMLVideoElement.requestVideoFrameCallback`](https://wicg.github.io/video-rvfc/) (resolves #365). The callback fires once per displayed video frame instead of once per display refresh, naturally stops while the video is paused, and receives frame metadata (`mediaTime`, `presentedFrames`, etc.) for syncing work to actual playback. `makeVideoFrameCallback` is non-reactive (no Solid owner required); `createVideoFrameCallback` wraps it in a signal and stops automatically `onCleanup`.
