<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Devices" alt="Solid Primitives Devices">
</p>

# @solid-primitives/devices

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/devices?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/devices)
[![size](https://img.shields.io/npm/v/@solid-primitives/devices?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/devices)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Creates a primitive to get a list of media devices (microphones, speakers, cameras). There are filtered primitives for convenience reasons.

## Installation

```
npm install @solid-primitives/devices
# or
yarn add @solid-primitives/devices
```

## How to use it

```ts
const devices = createDevices();

const microphones = createMicrophones();
const speakers = createSpeakers();
const cameras = createCameras();
```

The filtered primitives are build so that they only triggered if the devices of their own kind changed.

## Demo

TODO

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release loosely adapted from https://github.com/microcipcip/vue-use-kit/blob/master/src/functions/useMediaDevices/useMediaDevices.ts.

1.0.1

Released official version, CJS and updated to Stage 3

1.0.3

Add proper build process and clean up docs. Added SSR and CJS support.

1.0.4

Updated to latest Solid.

</details>
