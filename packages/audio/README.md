# @solid-primitives/audio

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

Primitive to manage audio playback in the browser. This primitive is comprised of three composed primitives:

`createBaseAudio` - Provides a very basic interface for wrapping listeners to a supplied or default audio player.

`createAudio` - Creates a very basic audio/sound player.

`createAudioManager` - Creates a full featured audio manager.

The primitives are easily composable and extended. To create your own audio element, consider using createBaseAudio which allows you to supply a player instance that matches the built-in standard Audio API.

## How to use it

```ts
const { play, pause } = createAudio("example.wav");
```

and

```ts
const { play, duration, currentTime, seek, setVolume, pause } = createAudioManager("example.wav");
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-audio-6wc4c

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Pulling an early release of the package together and preparing for 1.0.0 release. No changes.

1.0.0

Minor clean-up, added tests and released.

</details>
