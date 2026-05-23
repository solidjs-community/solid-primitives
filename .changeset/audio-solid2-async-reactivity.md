---
"@solid-primitives/audio": major
---

Adapt `createAudio` for Solid 2.0 async reactivity.

**Breaking changes:**

- `duration` now throws `NotReadyError` (from `solid-js`) until the audio metadata has loaded, integrating with Solid 2.0's `<Loading>` boundary. Previously it returned `NaN` before load. After the first `loadeddata` event it returns the duration in seconds reactively. The pending state resets whenever the source changes.

  ```tsx
  // Before (Solid 1.x): duration() returned NaN before metadata loaded
  // After (Solid 2.0): wrap in <Loading> to handle the pending state
  <Loading fallback="Loading...">
    <span>{audio.duration()}s</span>
  </Loading>
  ```

- SSR: `duration()` throws `NotReadyError` on the server (was previously `NaN`).

**Non-breaking improvements:**

- `isServer` is now imported from `solid-js/web` (compatible with shared vitest alias).
- All other signals (`playing`, `volume`, `currentTime`) are unchanged.
