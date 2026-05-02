<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Geolocation" alt="Solid Primitives Geolocation">
</p>

# @solid-primitives/geolocation

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/geolocation?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/geolocation)
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

### Definition

```ts
createGeolocation(
  options?: MaybeAccessor<PositionOptions>
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

### Definition

```ts
createGeolocationWatcher(
  enabled: MaybeAccessor<boolean>,
  options?: MaybeAccessor<PositionOptions>
): {
  location: Accessor<GeolocationCoordinates>;
  error: Accessor<GeolocationPositionError | null>;
}
```

---

## Types

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

## Demo

You may view a working example here: https://stackblitz.com/edit/vitejs-vite-dvk4m4

## Primitive Ideas

- `createDistance` — supply a lat/lng and reactively calculate the distance in km/m
- `createWithinRadius` — a signal for tracking if a user is within a radius boundary

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
