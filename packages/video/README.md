<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Video" alt="Solid Primitives Video">
</p>

# @solid-primitives/video

[![size](https://img.shields.io/badge/size-1.88_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/video)
[![version](https://img.shields.io/npm/v/@solid-primitives/video?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/video)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Layered primitives for managing HTML video playback. The `make*` variants are non-reactive and require no Solid owner. The `create*` variants integrate with Solid's reactive system — `createVideo` covers essential playback state, and `createVideoPlayer` extends it with the full control surface.

## Installation

```bash
npm install @solid-primitives/video
# or
yarn add @solid-primitives/video
# or
pnpm add @solid-primitives/video
```

## How to use it

### `makeVideo`

Creates a raw `HTMLVideoElement` with optional event handlers and initial configuration. No Solid owner required.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, onCleanup } from "solid-js";
import { makeVideo } from "@solid-primitives/video";

const SRC = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

function Demo() {
  const [events, setEvents] = createSignal<string[]>([]);
  const log = (e: Event) => setEvents(list => [...list.slice(-4), e.type]);
  const [player, cleanup] = makeVideo(
    SRC,
    { loadedmetadata: log, play: log, pause: log, ended: log },
    { muted: true, preload: "metadata" },
  );
  onCleanup(cleanup);
  player.controls = true;
  player.width = 320;
  return (
    <>
      {player}
      <p>events: {events().join(", ") || "none yet"}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const [player, cleanup] = makeVideo("clip.mp4", {}, { muted: true, loop: true });
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

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, onCleanup } from "solid-js";
import { makeVideoPlayer } from "@solid-primitives/video";

const SRC = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

function Demo() {
  const [playing, setPlaying] = createSignal(false);
  const [controls, cleanup] = makeVideoPlayer(
    SRC,
    { play: () => setPlaying(true), pause: () => setPlaying(false) },
    { muted: true },
  );
  onCleanup(cleanup);
  controls.player.width = 320;
  return (
    <>
      {controls.player}
      <div>
        <button onClick={() => (playing() ? controls.pause() : controls.play())}>
          {playing() ? "Pause" : "Play"}
        </button>
        <button onClick={() => controls.seek(0)}>Restart</button>
      </div>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const [{ play, pause, seek, setVolume, setMuted, setPlaybackRate, setLoop }, cleanup] =
  makeVideoPlayer("clip.mp4");

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

```tsx repl
import { render } from "@solidjs/web";
import { Loading } from "solid-js";
import { createVideo } from "@solid-primitives/video";

const SRC = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

function Demo() {
  const video = createVideo(SRC, { muted: true, preload: "metadata" });
  video.player.width = 320;
  return (
    <>
      {video.player}
      <div>
        <button onClick={() => video.setPlaying(!video.playing())}>
          {video.playing() ? "Pause" : "Play"}
        </button>
        <Loading fallback=" loading metadata…">
          <input
            type="range"
            min="0"
            max={video.duration()}
            step="0.1"
            value={video.currentTime()}
            onInput={e => video.seek(e.currentTarget.valueAsNumber)}
          />
        </Loading>
      </div>
      <p>
        {video.currentTime().toFixed(1)}s · ended: {String(video.ended())}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const video = createVideo("clip.mp4");
// or with a reactive source:
const video = createVideo(() => selectedUrl());

video.playing(); // boolean — true while actively playing
video.setPlaying(true); // plays
video.currentTime(); // seconds
video.seek(30);
video.ended(); // boolean
video.seeking(); // boolean — true while scrubbing
video.error(); // MediaError | null
```

The `duration` accessor throws `NotReadyError` until video metadata has loaded, integrating with Solid 2.0's `<Loading>` boundary:

```tsx
<Loading fallback="Loading…">
  <span>{video.duration()}s</span>
</Loading>
```

```ts
function createVideo(src: VideoSource | Accessor<VideoSource>, options?: VideoOptions): VideoReturn;
```

### `createVideoPlayer`

Extends `createVideo` with the full control surface: volume, muted, playback rate, loop, buffering state, and dimensions. Accepts all `VideoOptions` plus `volume` and `playbackRate` initial values.

```tsx repl
import { render } from "@solidjs/web";
import { createVideoPlayer } from "@solid-primitives/video";

const SRC = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

function Demo() {
  const video = createVideoPlayer(SRC, { volume: 0.5 });
  video.player.controls = true;
  video.player.width = 320;
  return (
    <>
      {video.player}
      <div>
        <button onClick={() => video.setPlaybackRate(video.playbackRate() === 1 ? 2 : 1)}>
          {video.playbackRate()}× speed
        </button>
        <button onClick={() => video.setLoop(!video.loop())}>loop: {String(video.loop())}</button>
      </div>
      <div>
        <button onClick={() => video.setMuted(!video.muted())}>
          {video.muted() ? "Unmute" : "Mute"}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={video.volume()}
          onInput={e => video.setVolume(e.currentTarget.valueAsNumber)}
        />
      </div>
      <p>
        volume {Math.round(video.volume() * 100)}% · readyState {video.readyState()} ·{" "}
        {video.videoWidth()}×{video.videoHeight()}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const video = createVideoPlayer("clip.mp4", {
  muted: true,
  volume: 0.8,
  playbackRate: 1,
});

// All fields from createVideo, plus:
video.volume(); // 0–1
video.setVolume(0.5);
video.muted(); // boolean
video.setMuted(true);
video.playbackRate(); // number
video.setPlaybackRate(1.5);
video.loop(); // boolean
video.setLoop(true);
video.buffered(); // TimeRanges | undefined
video.readyState(); // 0–4
video.videoWidth(); // intrinsic pixel width
video.videoHeight(); // intrinsic pixel height
```

> **Fullscreen** is intentionally omitted — use the dedicated `@solid-primitives/fullscreen` primitive to manage fullscreen state and attach it to `video.player`.

```ts
function createVideoPlayer(
  src: VideoSource | Accessor<VideoSource>,
  options?: VideoControlsOptions,
): VideoControlsReturn;
```

### `makeVideoFrameCallback`

Wraps [`HTMLVideoElement.requestVideoFrameCallback`](https://wicg.github.io/video-rvfc/), which fires once per displayed video frame instead of once per display refresh — it stops naturally while the video is paused, and the `metadata` argument (`mediaTime`, `presentedFrames`, etc.) lets you sync work to actual playback instead of wall-clock time. No Solid owner required.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, onCleanup } from "solid-js";
import { makeVideo, makeVideoFrameCallback } from "@solid-primitives/video";

const SRC = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

function Demo() {
  const supported = "requestVideoFrameCallback" in HTMLVideoElement.prototype;
  const [mediaTime, setMediaTime] = createSignal(0);
  const [player, cleanup] = makeVideo(SRC, {}, { muted: true, loop: true, autoPlay: true });
  const [, start, stop] = makeVideoFrameCallback(player, (_, meta) => setMediaTime(meta.mediaTime));
  onCleanup(() => {
    stop();
    cleanup();
  });
  player.controls = true;
  player.width = 320;
  if (supported) start();
  return (
    <>
      {player}
      <p>
        {supported
          ? `frame mediaTime: ${mediaTime().toFixed(3)}s`
          : "requestVideoFrameCallback is not supported in this browser"}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const [player, cleanup] = makeVideo("clip.mp4");
const [running, start, stop] = makeVideoFrameCallback(player, (now, metadata) => {
  draw(metadata.mediaTime);
});
start();
stop();
cleanup();
```

```ts
function makeVideoFrameCallback(
  video: HTMLVideoElement,
  callback: VideoFrameRequestCallback,
): [running: () => boolean, start: VoidFunction, stop: VoidFunction];
```

### `createVideoFrameCallback`

Reactive version of `makeVideoFrameCallback` — takes an accessor for the video element, so it re-attaches whenever the element changes and stops cleanly when it becomes `undefined`. `running` is a Solid signal, and playback is automatically stopped `onCleanup`.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createVideo, createVideoFrameCallback } from "@solid-primitives/video";

const SRC = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

function Demo() {
  const supported = "requestVideoFrameCallback" in HTMLVideoElement.prototype;
  const [frames, setFrames] = createSignal(0);
  const video = createVideo(SRC, { muted: true, loop: true });
  const [running, start, stop] = createVideoFrameCallback(
    () => video.player,
    (_, meta) => setFrames(meta.presentedFrames),
  );
  video.player.controls = true;
  video.player.width = 320;
  if (supported) start();
  return (
    <>
      {video.player}
      <div>
        <button onClick={() => (running() ? stop() : start())} disabled={!supported}>
          {running() ? "Stop counting" : "Start counting"}
        </button>
      </div>
      <p>
        {supported
          ? `presented frames: ${frames()} (play the video to count)`
          : "requestVideoFrameCallback is not supported in this browser"}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const video = createVideo("clip.mp4");
const [running, start, stop] = createVideoFrameCallback(
  () => video.player,
  (now, metadata) => {
    console.log(metadata.presentedFrames);
  },
);
start();
```

```ts
function createVideoFrameCallback(
  el: Accessor<HTMLVideoElement | undefined>,
  callback: VideoFrameRequestCallback,
): [running: Accessor<boolean>, start: VoidFunction, stop: VoidFunction];
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
