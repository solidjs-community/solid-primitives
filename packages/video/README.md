<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Video" alt="Solid Primitives Video">
</p>

# @solid-primitives/video

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/video?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/video)
[![version](https://img.shields.io/npm/v/@solid-primitives/video?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/video)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Layered primitives for managing HTML video playback. The `make*` variants are non-reactive and require no Solid owner. The `create*` variants integrate with Solid's reactive system — `createVideo` covers essential playback state, and `createVideoPlayer` extends it with the full control surface.

## Installation

```bash
npm install @solid-primitives/video
# or
pnpm add @solid-primitives/video
```

## How to use it

### `makeVideo`

Creates a raw `HTMLVideoElement` with optional event handlers and initial configuration. No Solid owner required.

```ts
const [player, cleanup] = makeVideo('clip.mp4', {}, { muted: true, loop: true });
cleanup();
```

```ts
function makeVideo(
  src: VideoSource | HTMLVideoElement,
  handlers?: VideoEventHandlers,
  options?: VideoOptions,
): [player: HTMLVideoElement, cleanup: VoidFunction];
```

### `makeVideoPlayer`

Wraps `makeVideo` with imperative playback controls. No Solid owner required.

```ts
const [{ play, pause, seek, setVolume, setMuted, setPlaybackRate, setLoop }, cleanup] =
  makeVideoPlayer('clip.mp4');

await play();
seek(30);
setPlaybackRate(1.5);
setLoop(true);
cleanup();
```

```ts
function makeVideoPlayer(
  src: VideoSource | HTMLVideoElement,
  handlers?: VideoEventHandlers,
  options?: VideoOptions,
): [controls: VideoControls, cleanup: VoidFunction];
```

### `createVideo`

Essential reactive playback state: `playing`, `currentTime`, `ended`, `seeking`, `error`, and an async `duration` that suspends until metadata is loaded.

```ts
const video = createVideo('clip.mp4');
// or with a reactive source:
const video = createVideo(() => selectedUrl());

video.playing()         // boolean — true while actively playing
video.setPlaying(true)  // plays
video.currentTime()     // seconds
video.seek(30)
video.ended()           // boolean
video.seeking()         // boolean — true while scrubbing
video.error()           // MediaError | null
```

The `duration` accessor throws `NotReadyError` until video metadata has loaded, integrating with Solid 2.0's `<Loading>` boundary:

```tsx
<Loading fallback="Loading…">
  <span>{video.duration()}s</span>
</Loading>
```

```ts
function createVideo(
  src: VideoSource | Accessor<VideoSource>,
  options?: VideoOptions,
): VideoReturn;
```

### `createVideoPlayer`

Extends `createVideo` with the full control surface: volume, muted, playback rate, loop, buffering state, and dimensions. Accepts all `VideoOptions` plus `volume` and `playbackRate` initial values.

```ts
const video = createVideoPlayer('clip.mp4', {
  muted: true,
  volume: 0.8,
  playbackRate: 1,
});

// All fields from createVideo, plus:
video.volume()              // 0–1
video.setVolume(0.5)
video.muted()               // boolean
video.setMuted(true)
video.playbackRate()        // number
video.setPlaybackRate(1.5)
video.loop()                // boolean
video.setLoop(true)
video.buffered()            // TimeRanges | undefined
video.readyState()          // 0–4
video.videoWidth()          // intrinsic pixel width
video.videoHeight()         // intrinsic pixel height
```

> **Fullscreen** is intentionally omitted — use the dedicated `@solid-primitives/fullscreen` primitive to manage fullscreen state and attach it to `video.player`.

```ts
function createVideoPlayer(
  src: VideoSource | Accessor<VideoSource>,
  options?: VideoControlsOptions,
): VideoControlsReturn;
```

## Types

```ts
type VideoSource = string | undefined | MediaProvider;

type VideoOptions = {
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: "" | "none" | "metadata" | "auto";
};

type VideoControlsOptions = VideoOptions & {
  volume?: number;
  playbackRate?: number;
};

type VideoReturn = {
  player: HTMLVideoElement;
  playing: Accessor<boolean>;
  setPlaying: (v: boolean) => void;
  currentTime: Accessor<number>;
  seek: (time: number) => void;
  ended: Accessor<boolean>;
  seeking: Accessor<boolean>;
  error: Accessor<MediaError | null>;
  duration: Accessor<number>; // throws NotReadyError until loaded
};

type VideoControlsReturn = VideoReturn & {
  volume: Accessor<number>;
  setVolume: (v: number) => void;
  muted: Accessor<boolean>;
  setMuted: (v: boolean) => void;
  playbackRate: Accessor<number>;
  setPlaybackRate: (rate: number) => void;
  loop: Accessor<boolean>;
  setLoop: (v: boolean) => void;
  buffered: Accessor<TimeRanges | undefined>;
  readyState: Accessor<number>;
  videoWidth: Accessor<number>;
  videoHeight: Accessor<number>;
};
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
