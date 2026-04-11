import { createStaticStore } from "@solid-primitives/static-store";
import { access, type MaybeAccessor } from "@solid-primitives/utils";
import { type Accessor, createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

const geolocationDefaults: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 0,
  timeout: Number.POSITIVE_INFINITY,
};

/**
 * Generates a primitive to perform a one-time geolocation query.
 * Returns an async memo that suspends until the position resolves,
 * integrating with `<Suspense>` / `<Loading>` boundaries.
 *
 * @param options - Position options (accuracy, timeout, maximum age)
 * @returns Tuple of `[location, refetch]`
 *
 * @example
 * ```ts
 * const [location, refetch] = createGeolocation();
 * // In JSX:
 * // <Suspense fallback="Locating...">
 * //   <div>{location().latitude}</div>
 * // </Suspense>
 * ```
 */
export const createGeolocation = (
  options?: MaybeAccessor<PositionOptions>,
): [location: Accessor<GeolocationCoordinates | undefined>, refetch: VoidFunction] => {
  if (isServer) {
    return [() => undefined, () => {}];
  }

  const [version, bump] = createSignal(0);

  const location = createMemo(
    () =>
      new Promise<GeolocationCoordinates>((resolve, reject) => {
        version(); // track for manual refetch
        if (!("geolocation" in navigator)) {
          return reject(new Error("Geolocation is not supported."));
        }
        navigator.geolocation.getCurrentPosition(
          res => resolve(res.coords),
          error => reject(Object.assign(new Error(error.message), error)),
          Object.assign({}, geolocationDefaults, access(options)),
        );
      }),
  ) as Accessor<GeolocationCoordinates | undefined>;

  return [location, () => bump(v => v + 1)];
};

/**
 * Creates a primitive that watches geolocation in real-time.
 * The watcher can be toggled on/off reactively via the `enabled` parameter.
 *
 * @param enabled - Whether the watcher should be active
 * @param options - Position options (accuracy, timeout, maximum age)
 * @returns Object with reactive `location` and `error` properties
 *
 * @example
 * ```ts
 * const [enabled, setEnabled] = createSignal(true);
 * const { location, error } = createGeolocationWatcher(enabled);
 * ```
 */
export const createGeolocationWatcher = (
  enabled: MaybeAccessor<boolean>,
  options?: MaybeAccessor<PositionOptions>,
): {
  location: GeolocationCoordinates | null;
  error: GeolocationPositionError | null;
} => {
  if (isServer) {
    return { location: null, error: null };
  }

  const [store, setStore] = createStaticStore<{
    location: null | GeolocationCoordinates;
    error: null | GeolocationPositionError;
  }>({
    location: null,
    error: null,
  });

  let watchId: number | null = null;

  const clearWatch = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  };

  // createEffect tracks `enabled` and `options`, starts/stops the watcher reactively.
  createEffect(() => {
    if (access(enabled)) {
      watchId = navigator.geolocation.watchPosition(
        res => setStore({ location: res.coords, error: null }),
        error => setStore({ location: null, error }),
        Object.assign({}, geolocationDefaults, access(options)),
      );
    } else {
      clearWatch();
    }
  });

  onCleanup(clearWatch);

  return store;
};
