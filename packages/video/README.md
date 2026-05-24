<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Video" alt="Solid Primitives Video">
</p>

# @solid-primitives/video

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/video?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/video)
[![version](https://img.shields.io/npm/v/@solid-primitives/video?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/video)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives to manage HTML video playback in the browser. The primitives are layered: `make*` variants are non-reactive base primitives that require no Solid owner, while `createVideo` integrates with Solid's reactive system.

Within an SSR context these primitives perform noops and never interrupt the process.

## Installation

```bash
npm install @solid-primitives/video
# or
yarn add @solid-primitives/video
# or
pnpm add @solid-primitives/video
```

## How to use it

### makeVideo

A foundational non-reactive primitive that creates a raw `HTMLVideoElement` with optional event handlers. No Solid owner required.

```ts
const [player, cleanup] = makeVideo("clip.mp4");
// later:
cleanup();
```

#### Definition

```ts
function makeVideo(
  src: VideoSource | HTMLVideoElement,
  handlers?: VideoEventHandlers,
): [player: HTMLVideoElement, cleanup: VoidFunction];
```

### makeVideoPlayer

Wraps `makeVideo` with playback and fullscreen controls. No Solid owner required.

```ts
const [{ play, pause, seek, setVolume, setMuted, setPlaybackRate, player }, cleanup] =
  makeVideoPlayer("clip.mp4");

await play();
seek(30);
setPlaybackRate(1.5);
await requestFullscreen();
cleanup();
```

#### Definition

```ts
function makeVideoPlayer(
  src: VideoSource | HTMLVideoElement,
  handlers?: VideoEventHandlers,
): [controls: VideoControls, cleanup: VoidFunction];
```

`VideoControls`:

```ts
type VideoControls = {
  play: () => Promise<void>;
  pause: VoidFunction;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  requestFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  player: HTMLVideoElement;
};
```

The `seek` function uses `fastSeek` on [supporting browsers](https://caniuse.com/?search=fastseek).

### createVideo

A reactive video primitive. Returns a flat object with writable signal accessors for `playing`, `volume`, `muted`, and `playbackRate`; reactive signals for `currentTime`, `ended`, `buffered`, `readyState`, `videoWidth`, `videoHeight`, and `fullscreen`; and an async `duration` that suspends until metadata is loaded — integrating with `<Loading>`.

```ts
const video = createVideo("clip.mp4");
// or with a reactive source:
const video = createVideo(() => selectedUrl());

video.playing()             // boolean
video.setPlaying(true)      // plays
video.volume()              // 0–1
video.setVolume(0.5)
video.muted()               // boolean
video.setMuted(true)
video.playbackRate()        // number
video.setPlaybackRate(1.5)
video.currentTime()         // seconds
video.seek(30)
video.ended()               // boolean
video.readyState()          // 0–4
video.videoWidth()          // intrinsic pixel width
video.videoHeight()         // intrinsic pixel height
video.fullscreen()          // boolean
video.requestFullscreen()
video.exitFullscreen()
video.toggleFullscreen()
```

Attach the `player` to a `<video>` element via `ref`:

```tsx
const video = createVideo("clip.mp4");

<video ref={el => { /* video.player === el */ }} src="clip.mp4" />
// or pass an existing element:
const video = createVideo(videoEl);
```

The `duration` accessor throws `NotReadyError` until video metadata has loaded, making it work naturally with Solid 2.0's `<Loading>` boundary. The pending state resets whenever the source changes.

```tsx
<Loading fallback="Loading…">
  <span>{video.duration()}s</span>
</Loading>
```

#### Definition

```ts
function createVideo(src: VideoSource | Accessor<VideoSource>): VideoReturn;
```

`VideoReturn`:

```ts
type VideoReturn = {
  player: HTMLVideoElement;
  playing: Accessor<boolean>;
  setPlaying: (v: boolean) => void;
  currentTime: Accessor<number>;
  seek: (time: number) => void;
  volume: Accessor<number>;
  setVolume: (v: number) => void;
  muted: Accessor<boolean>;
  setMuted: (v: boolean) => void;
  playbackRate: Accessor<number>;
  setPlaybackRate: (rate: number) => void;
  ended: Accessor<boolean>;
  buffered: Accessor<TimeRanges | undefined>;
  readyState: Accessor<number>;
  videoWidth: Accessor<number>;
  videoHeight: Accessor<number>;
  fullscreen: Accessor<boolean>;
  requestFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  duration: Accessor<number>;
};
```

`VideoSource`:

```ts
type VideoSource = string | undefined | MediaProvider;
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
