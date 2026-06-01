<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Devices" alt="Solid Primitives Devices">
</p>

# @solid-primitives/devices

[![size](https://img.shields.io/badge/size-552_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/devices)
[![size](https://img.shields.io/npm/v/@solid-primitives/devices?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/devices)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Reactive primitives for enumerating and filtering media input/output devices (microphones, speakers, cameras).

> **Looking for accelerometer or gyroscope?** Motion and orientation sensor primitives have moved to [`@solid-primitives/sensors`](../sensors/README.md).

## Installation

```
npm install @solid-primitives/devices
# or
pnpm add @solid-primitives/devices
```

## How to use it

### `createDevices`

Returns a reactive accessor for the full list of [`MediaDeviceInfo`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo) objects available to the browser. The list updates automatically whenever devices are added or removed.

```ts
import { createDevices } from "@solid-primitives/devices";

const devices = createDevices();
// => Accessor<MediaDeviceInfo[]>

createEffect(() => console.log(devices()));
```

### `createMicrophones` / `createSpeakers` / `createCameras`

Filtered convenience primitives that each return an accessor for a specific device kind. Each one only re-runs downstream computations when a device of its own kind changes — devices of other kinds changing do not trigger updates.

```ts
import { createMicrophones, createSpeakers, createCameras } from "@solid-primitives/devices";

const microphones = createMicrophones();
// => Accessor<MediaDeviceInfo[]>  (kind === "audioinput")

const speakers = createSpeakers();
// => Accessor<MediaDeviceInfo[]>  (kind === "audiooutput")

const cameras = createCameras();
// => Accessor<MediaDeviceInfo[]>  (kind === "videoinput")
```

## API

```ts
function createDevices(): Accessor<MediaDeviceInfo[]>;

function createMicrophones(): Accessor<MediaDeviceInfo[]>;
function createSpeakers(): Accessor<MediaDeviceInfo[]>;
function createCameras(): Accessor<MediaDeviceInfo[]>;
```

All four primitives:
- Are SSR-safe — return an empty array on the server.
- Require no arguments.
- Subscribe to [`devicechange`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/devicechange_event) events and clean up automatically via `onCleanup`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
