<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Geolocation" alt="Solid Primitives Geolocation">
</p>

# @solid-primitives/geolocation

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/geolocation?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/geolocation)
[![size](https://img.shields.io/npm/v/@solid-primitives/geolocation?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/geolocation)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives to query and watch geolocation information from within the browser.

## Installation

```
npm install @solid-primitives/geolocation
# or
yarn add @solid-primitives/geolocation
```

## How to use it

### createGeolocation

Used to fetch current geolocation data as a resource.

```ts
const [location, refetch] = createGeolocation();
```

or with options:

```ts
const [location, refetch] = createGeolocation({
  enableHighAccuracy: false,
  maximumAge: 0,
  timeout: 200
});
```

### createGeolocationWatcher

Creates a geolocation watcher and updates a signal with the latest coordinates.

```ts
const [location, error] = createGeolocationWatcher(true);
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-geolocation-fhzu4?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Pulling an early release of the package together and preparing for 1.0.0 release. No changes.

1.0.0

Added testing, improved types, changed name of createGeolocationWatcher to createGeolocationMonitor.

1.0.6

Published with CJS and SSR support.

1.0.7

Changed to peerDependencies and updated to latest Solid.

1.1.1

Improved tests and type dependencies.

</details>
