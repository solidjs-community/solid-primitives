# @solid-primitives/audio

Primitive to manage audio playback in the browser. This primitive is comprised of three composed primitives:

`createBaseAudio` - Provides a very basic interface for wrapping listeners to a supplied or default audio player.
`createAudio` - Creates a very basic audio/sound player.
`createAudioManager` - Creates a full featured audio manager.

The primitives are easily composable and extended. To create your own audio element, consider using createBaseAudio which allows you to supply a player instance that matches the built-in standard Audio API.

## How to use it

```ts
const { play, pause } = createAudio('example.js')
```

or

```ts
const { play, duration, currentTime, seek, setVolume, pause } =
    createAudioManager('example.js')
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-create-audio-6wc4c?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

First ported commit from react-use-localstorage.

</details>

## Contributors

Ported from the amazing work by at https://github.com/dance2die/react-use-localstorage.
