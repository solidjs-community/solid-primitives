# solid-create-geolocation

Primitive to manage geolocation requests. Geolocation is segmented into two primitives.

`createGeolocation` - Used as a one-off geolocation query and storage utility.
`createGeolocationWatcher` - Creates a watcher and updates a signal with the latest geolocation values.

## How to use it

```ts
const { location, getLocation } = createGeolocation()
```

or

```ts
const location = createGeolocation()
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-create-geolocation-fhzu4?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

First ported commit from react-use-localstorage.

</details>

## Contributors

Ported from the amazing work by at https://github.com/dance2die/react-use-localstorage.
