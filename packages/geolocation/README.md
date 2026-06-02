<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Geolocation" alt="Solid Primitives Geolocation">
</p>

# @solid-primitives/geolocation

[![size](https://img.shields.io/badge/size-1.23_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/geolocation)
[![size](https://img.shields.io/npm/v/@solid-primitives/geolocation?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/geolocation)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives to query and watch geolocation information from within the browser.

## Installation

```bash
npm install @solid-primitives/geolocation
# or
pnpm add @solid-primitives/geolocation
```

## `makeGeolocation`

A non-reactive one-shot query. No Solid owner required — can be used outside components. Returns a `[query, cleanup]` tuple.

```ts
const [query, cleanup] = makeGeolocation({ enableHighAccuracy: true });
const coords = await query();
cleanup();
```

### Definition

```ts
makeGeolocation(
  options?: PositionOptions
): [query: () => Promise<GeolocationCoordinates>, cleanup: VoidFunction]
```

---

## `makeGeolocationWatcher`

A non-reactive continuous watcher. No Solid owner required. Returns a `[store, cleanup]` tuple.

```ts
const [store, cleanup] = makeGeolocationWatcher();
console.log(store.location); // GeolocationCoordinates | null
console.log(store.error); // GeolocationPositionError | null
cleanup();
```

### Definition

```ts
makeGeolocationWatcher(
  options?: PositionOptions
): [
  store: { location: GeolocationCoordinates | null; error: GeolocationPositionError | null },
  cleanup: VoidFunction
]
```

---

## `createGeolocation`

A reactive one-shot query. Returns an async accessor that integrates with `<Loading>` boundaries — the component subtree suspends until the position resolves. Re-queries automatically when reactive `options` change, or manually via `refetch()`.

```ts
const [location, refetch] = createGeolocation();
```

```tsx
// Suspends until first fix:
<Loading fallback="Locating...">
  <div>{location().latitude}, {location().longitude}</div>
</Loading>

// Show a subtle indicator while re-querying in the background:
<Show when={isPending(() => location())}>Updating position...</Show>
```

With reactive options:

```ts
const [opts, setOpts] = createSignal<PositionOptions>({ enableHighAccuracy: false });
const [location, refetch] = createGeolocation(opts);
// Automatically re-queries when opts() changes
```

With a server-side seed (e.g. IP geolocation from Cloudflare):

```ts
// On the server, location() resolves immediately with the seed instead of throwing NotReadyError.
// On the client, the seed is ignored and GPS is queried directly.
const [location, refetch] = createGeolocation(undefined, { latitude: cf.latitude, longitude: cf.longitude });
```

### Definition

```ts
createGeolocation(
  options?: MaybeAccessor<PositionOptions>,
  initialLocation?: GeolocationCoord
): [location: () => Promise<GeolocationCoordinates>, refetch: VoidFunction]
```

---

## `createGeolocationWatcher`

A reactive continuous watcher. `location` throws `NotReadyError` (integrating with `<Loading>`) until the first GPS fix, then updates reactively without re-suspending. `error` is a signal accessor for recoverable in-component error handling. The watcher starts and stops reactively based on `enabled`. Reactive `options` restarts the watcher when the enabled state is active.

```ts
const [enabled, setEnabled] = createSignal(true);
const { location, error } = createGeolocationWatcher(enabled);
```

```tsx
// Show error inline (recoverable — no error boundary needed):
<Show when={error()}>
  Permission denied — <button onClick={retry}>retry</button>
</Show>

// Suspends until first GPS fix, then updates live:
<Loading fallback="Acquiring GPS fix...">
  <Map lat={location().latitude} lng={location().longitude} />
</Loading>
```

With a server-side seed (e.g. IP geolocation from Cloudflare):

```ts
// On the server, location() returns the seed immediately — no NotReadyError, no <Loading> flash.
// On the client, the seed is the initial signal value; real GPS coordinates replace it as soon
// as the watcher fires.
const { location, error } = createGeolocationWatcher(true, undefined, {
  latitude: cf.latitude,
  longitude: cf.longitude,
});
```

Non-lat/lng fields (`accuracy`, `altitude`, `heading`, `speed`) are set to `0` or `null` on a seeded value. They are replaced by real values once GPS fires on the client.

### Definition

```ts
createGeolocationWatcher(
  enabled: MaybeAccessor<boolean>,
  options?: MaybeAccessor<PositionOptions>,
  initialLocation?: GeolocationCoord
): {
  location: Accessor<GeolocationCoordinates>;
  error: Accessor<GeolocationPositionError | null>;
}
```

---

## `createDistance`

Reactively calculates the distance from the user's current GPS location to a target coordinate using the [Haversine formula](https://en.wikipedia.org/wiki/Haversine_formula). Returns `null` until the first GPS fix arrives.

```ts
const distance = createDistance({ latitude: 48.8566, longitude: 2.3522 });
```

```tsx
<Show when={distance() !== null} fallback="Locating...">
  {distance()!.toFixed(1)} km from the Eiffel Tower
</Show>
```

With a reactive target and metre units:

```ts
const [target, setTarget] = createSignal({ latitude: 48.8566, longitude: 2.3522 });
const distance = createDistance(target, { unit: "m" });
```

### Definition

```ts
createDistance(
  target: MaybeAccessor<GeolocationCoord>,
  options?: {
    unit?: "km" | "m";            // default "km"
    enabled?: MaybeAccessor<boolean>;
    watcherOptions?: MaybeAccessor<PositionOptions>;
    initialLocation?: GeolocationCoord;
  }
): Accessor<number | null>
```

---

## `createWithinRadius`

Reactively tracks whether the user's GPS location is within a given radius (in **metres**) of a centre coordinate. Returns `false` until the first GPS fix arrives.

```ts
const nearby = createWithinRadius({ latitude: 48.8566, longitude: 2.3522 }, 500);
```

```tsx
<Show when={nearby()}>You are near the Eiffel Tower!</Show>
```

With a reactive radius:

```ts
const [radius, setRadius] = createSignal(500);
const nearby = createWithinRadius({ latitude: 48.8566, longitude: 2.3522 }, radius);
```

### Definition

```ts
createWithinRadius(
  center: MaybeAccessor<GeolocationCoord>,
  radius: MaybeAccessor<number>,  // in metres
  options?: {
    enabled?: MaybeAccessor<boolean>;
    watcherOptions?: MaybeAccessor<PositionOptions>;
    initialLocation?: GeolocationCoord;
  }
): Accessor<boolean>
```

---

## SSR / Server-side initial location

By default all reactive primitives throw `NotReadyError` on the server, which integrates with `<Loading>` boundaries to show a fallback during SSR. If you can supply approximate coordinates server-side (for example from Cloudflare's `cf.latitude` / `cf.longitude` request headers, or any other IP geolocation service), you can pass them as `initialLocation` to skip the loading state entirely.

```ts
// SolidStart server loader example
export const route = {
  load: async ({ request }) => {
    const lat = Number(request.headers.get("cf-iplatitude"));
    const lng = Number(request.headers.get("cf-iplongitude"));
    return { ipCoords: { latitude: lat, longitude: lng } };
  },
};

// Component
const data = useRouteData<typeof route.load>();

// Server: renders immediately with IP coords — no <Loading> flash.
// Client: IP coords are the initial signal value; real GPS replaces them on the first fix.
const { location } = createGeolocationWatcher(true, undefined, data()?.ipCoords);
```

When a seed is provided:
- **Server** — `location()` / `distance()` / `within()` return values derived from the seed instead of throwing or returning `null`/`false`.
- **Client** — the seed is the starting value; the GPS watcher overwrites it as soon as the first fix arrives. No `<Loading>` suspension occurs if the seed is present.
- Fields beyond `latitude`/`longitude` (`accuracy`, `altitude`, `heading`, `speed`) are `0` or `null` until real GPS data arrives.

---

## Types

```ts
type GeolocationCoord = { latitude: number; longitude: number };
```

```ts
interface GeolocationCoordinates {
  readonly accuracy: number;
  readonly altitude: number | null;
  readonly altitudeAccuracy: number | null;
  readonly heading: number | null;
  readonly latitude: number;
  readonly longitude: number;
  readonly speed: number | null;
}
```

Default position options (overridden by anything you pass):

```ts
const geolocationDefaults: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 0,
  timeout: Number.POSITIVE_INFINITY,
};
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
