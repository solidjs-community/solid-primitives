# @solid-primitives/geolocation

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

Primitive to manage geolocation requests. Geolocation is segmented into two primitives.

`createGeolocation` - Used as a one-off geolocation query and storage utility.
`createGeolocationWatcher` - Creates a watcher and updates a signal with the latest geolocation values.

## How to use it

```ts
const { location, getLocation, isLoading } = createGeolocation();
```

or

```ts
const location = createGeolocation();
```

or

```ts
const [location] = createGeolocation({true, 0, 100});
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-geolocation-fhzu4?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Pulling an early release of the package together and preparing for 1.0.0 release. No changes.

</details>
