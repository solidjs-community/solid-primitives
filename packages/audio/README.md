<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Audio" alt="Solid Primitives Audio">
</p>

# @solid-primitives/audio

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/audio?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/audio)
[![size](https://img.shields.io/npm/v/@solid-primitives/audio?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/audio)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitive to manage audio playback in the browser. The primitives are easily composable and extended. To create your own audio element, consider using makeAudioPlayer which allows you to supply a player instance that matches the built-in standard Audio API.

Each primitive also exposes the audio instance for further custom extensions. Within an SSR context this audio primitive performs noops but never interrupts the process. Time values and durations are zero'd and in LOADING state.

## Installation

```
npm install @solid-primitives/audio
# or
yarn add @solid-primitives/audio
```

## How to use it

### makeAudio

A foundational primitive with no player controls but exposes the raw player object.

```ts
const player = makeAudio("example.wav");
```

### makeAudioPlayer

Provides a very basic interface for wrapping listeners to a supplied or default audio player.

```ts
const { play, pause } = makeAudioPlayer("example.wav");
```

### createAudioManager

Creates a very basic audio/sound player.

```ts
const [playing setPlaying] = createSignal(false);
const { state, currentTime, duration } = createAudio('example.wav', playing);
setPlaying(true);
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

1.1.6

Added proper SSR and CJS support.

1.1.8

Updated to Solid 1.3.

1.2.0

Major improvements to bring package in line with project standards.

</details>
