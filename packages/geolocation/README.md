# @solid-primitives/geolocation

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

Primitive to manage geolocation requests. Geolocation is segmented into two primitives.

`createGeolocation` - Used as a one-off geolocation query and storage utility.
`createGeolocationWatcher` - Creates a geolocation watcher and updates a signal with the latest values.

## How to use it

Basic use with refetch and loading:

```ts
const [location, refetch] = createGeolocation();
```

or with options:

```ts
const [location] = createGeolocation({
  enableHighAccuracy: false,
  maximumAge: 0,
  timeout: 200
});
```

or with location monitoring:

```ts
const location = createGeolocationWatcher(true);
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

</details>
