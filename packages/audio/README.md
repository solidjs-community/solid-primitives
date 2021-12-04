# @solid-primitives/audio

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/audio?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/audio)
[![size](https://img.shields.io/npm/v/@solid-primitives/audio?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/audio)

Primitive to manage audio playback in the browser. The primitives are easily composable and extended. To create your own audio element, consider using createAudioPlayer which allows you to supply a player instance that matches the built-in standard Audio API.

Each primitive also exposes the audio instance for further custom extensions. Within an SSR context this audio primitive performs noops but never interrupts the process. Time values and durations are zero'd and in LOADING state.

## Installation

```
npm install @solid-primitives/audio
# or
yarn add @solid-primitives/audio
```

## How to use it

### createAudioPlayer

A foundational primitive with no player controls but exposes the raw player object.

```ts
const { player } = createAudioPlayer("example.wav");
```

### createAudio

Provides a very basic interface for wrapping listeners to a supplied or default audio player.

```ts
const { play, pause } = createAudioManager("example.wav");
```

### createAIdop

Creates a very basic audio/sound player.

```ts
const { play, pause, duration, currentTime, seek, setVolume } = createAudioManager("example.wav");
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-audio-5c9f3

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Pulling an early release of the package together and preparing for 1.0.0 release. No changes.

1.0.0

Minor clean-up, added tests and released.

1.0.1

Added testing and support for srcObject.

1.1.5

Added proper SSR support.

</details>
