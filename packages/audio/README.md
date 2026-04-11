<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Audio" alt="Solid Primitives Audio">
</p>

# @solid-primitives/audio

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/audio?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/audio)
[![size](https://img.shields.io/npm/v/@solid-primitives/audio?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/audio)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives to manage audio playback in the browser. The primitives are layered: `make*` variants are non-reactive base primitives that require no Solid owner, while `createAudio` integrates with Solid's reactive system.

Within an SSR context these primitives perform noops and never interrupt the process.

## Installation

```
npm install @solid-primitives/audio
# or
yarn add @solid-primitives/audio
```

## How to use it

### makeAudio

A foundational non-reactive primitive that creates a raw `HTMLAudioElement` with optional event handlers. No Solid owner required.

```ts
const [player, cleanup] = makeAudio("example.mp3");
// later:
cleanup();
```

#### Definition

```ts
function makeAudio(
  src: AudioSource | HTMLAudioElement,
  handlers?: AudioEventHandlers,
): [player: HTMLAudioElement, cleanup: VoidFunction];
```

### makeAudioPlayer

Wraps `makeAudio` with simple playback controls. No Solid owner required.

```ts
const [{ play, pause, seek, setVolume, player }, cleanup] = makeAudioPlayer("example.mp3");
play();
seek(30);
cleanup();
```

#### Definition

```ts
function makeAudioPlayer(
  src: AudioSource | HTMLAudioElement,
  handlers?: AudioEventHandlers,
): [controls: AudioControls, cleanup: VoidFunction];
```

`AudioControls`:

```ts
type AudioControls = {
  play: () => Promise<void>;
  pause: VoidFunction;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  player: HTMLAudioElement;
};
```

The `seek` function uses `fastSeek` on [supporting browsers](https://caniuse.com/?search=fastseek).

### createAudio

A reactive audio primitive. Returns a flat object with writable signal accessors for `playing` and `volume`, a reactive `currentTime`, and an async `duration` that suspends until audio metadata is loaded — integrating with `<Suspense>` / `<Loading>`.

```ts
const audio = createAudio("example.mp3");

audio.playing()        // boolean
audio.setPlaying(true) // plays
audio.volume()         // 0–1
audio.setVolume(0.5)
audio.currentTime()    // seconds
audio.seek(30)
```

The `duration` accessor returns a Promise, so wrap it in `<Suspense>`:

```tsx
<Suspense fallback="Loading...">
  <span>{audio.duration()}s</span>
</Suspense>
```

The `src` argument can be a reactive accessor — switching sources replaces the track and seeks to the start:

```ts
const [src, setSrc] = createSignal("track1.mp3");
const audio = createAudio(src);
setSrc("track2.mp3");
```

#### Definition

```ts
function createAudio(src: AudioSource | Accessor<AudioSource>): AudioReturn;
```

`AudioReturn`:

```ts
type AudioReturn = {
  player: HTMLAudioElement;
  playing: Accessor<boolean>;
  setPlaying: (v: boolean) => void;
  volume: Accessor<number>;
  setVolume: (v: number) => void;
  currentTime: Accessor<number>;
  duration: Accessor<number>; // async — suspends until loaded
  seek: (time: number) => void;
};
```

## Audio Source

All primitives accept `AudioSource` as their `src` argument:

```ts
type AudioSource = string | undefined | MediaProvider;
```

This includes `MediaSource` and `MediaStream`, enabling streamed or Blob-backed audio:

```ts
const media = new MediaSource();
const audio = createAudio(URL.createObjectURL(media));
```

## Demo

You may view a working example here: https://stackblitz.com/edit/vitejs-vite-zwfs6h?file=src%2Fmain.tsx

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
