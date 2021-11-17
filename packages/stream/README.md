---
Name: stream
Package: "@solid-primitives/stream"
Primitives: createStream, createAmplitudeStream
---

# @solid-primitives/stream

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/stream)](https://bundlephobia.com/package/@solid-primitives/stream)
[![size](https://img.shields.io/npm/v/@solid-primitives/stream)](https://www.npmjs.com/package/@solid-primitives/stream)

Creates primitives to work with media streams from microphones, cameras or the screen.

## How to use it

```ts
const [stream, { mutate, refetch, stop } = createStream(constraints: MediaDeviceInfo | MediaStreamConstraints);

stream: Accessor<MediaStream | undefined> & { loading: boolean, error: any }
mutate: (stream: MediaStream | undefined) => void // overwrite the stream
refetch: () => void // refetch the stream without changing the constraints
stop: () => void // stop the current stream

const [amplitude, { mutate, refetch, stop } = createAmplitudeStream(device: MediaDeviceInfo);

amplitude: Accessor<number> & { loading: boolean, error: any }
// otherwise like createStream

createMediaPermissionRequest(target?: 'audio' | 'video' | MediaStreamConstraints);
// use the createPermission primitive to watch the permissions.
```

## Demo

TODO

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release.

</details>
