import { isServer } from "@solidjs/web";
import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js";
import { access, noop, type MaybeAccessor } from "@solid-primitives/utils";

const geolocationDefaults: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 0,
  timeout: Number.POSITIVE_INFINITY,
};

const mergeOptions = (options?: PositionOptions): PositionOptions =>
  Object.assign({}, geolocationDefaults, options);

/**
 * Performs a single geolocation query. Non-reactive — no Solid owner required.
 *
 * @param options - Position options
 * @returns Tuple of `[query, cleanup]`
 *
 * @example
 * ```ts
 * const [query, cleanup] = makeGeolocation();
 * const coords = await query();
 * cleanup();
 * ```
 */
export const makeGeolocation = (
  options?: PositionOptions,
): [query: () => Promise<GeolocationCoordinates>, cleanup: VoidFunction] => {
  if (isServer)
    return [() => Promise.reject(new Error("Geolocation is not available on the server.")), noop];

  let active = true;
  const query = () =>
    new Promise<GeolocationCoordinates>((resolve, reject) => {
      if (!active) return;
      if (!("geolocation" in navigator)) {
        return reject(new Error("Geolocation is not supported."));
      }
      navigator.geolocation.getCurrentPosition(
        res => resolve(res.coords),
        error => reject(Object.assign(new Error(error.message), error)),
        mergeOptions(options),
      );
    });

  return [query, () => (active = false)];
};

/**
 * Starts a continuous geolocation watcher. Non-reactive — no Solid owner required.
 *
 * @param options - Position options
 * @returns Tuple of `[{ location, error }, cleanup]`
 *
 * @example
 * ```ts
 * const [{ location, error }, cleanup] = makeGeolocationWatcher();
 * ```
 */
export const makeGeolocationWatcher = (
  options?: PositionOptions,
): [
  store: { location: GeolocationCoordinates | null; error: GeolocationPositionError | null },
  cleanup: VoidFunction,
] => {
  if (isServer) return [{ location: null, error: null }, noop];

  const store = {
    location: null as GeolocationCoordinates | null,
    error: null as GeolocationPositionError | null,
  };

  const watchId = navigator.geolocation.watchPosition(
    res => {
      store.location = res.coords;
      store.error = null;
    },
    err => {
      store.location = null;
      store.error = err;
    },
    mergeOptions(options),
  );

  return [store, () => navigator.geolocation.clearWatch(watchId)];
};

/**
 * Reactive one-shot geolocation query. Returns an async accessor that suspends
 * until the position resolves, integrating with `<Suspense>` / `<Loading>` boundaries.
 * Re-queries when `options` changes or when `refetch` is called.
 *
 * @param options - Reactive position options
 * @returns Tuple of `[location, refetch]`
 *
 * @example
 * ```ts
 * const [location, refetch] = createGeolocation();
 * // In JSX — suspends until first fix:
 * // <Suspense fallback="Locating...">
 * //   <div>{location().latitude}, {location().longitude}</div>
 * // </Suspense>
 * // Check if re-querying in the background:
 * // <Show when={isPending(() => location())}>Updating...</Show>
 * ```
 */
export const createGeolocation = (
  options?: MaybeAccessor<PositionOptions>,
): [location: () => Promise<GeolocationCoordinates>, refetch: VoidFunction] => {
  if (isServer) {
    const stub = () => {
      throw new Error("Geolocation is not available on the server.");
    };
    return [stub as Accessor<GeolocationCoordinates>, noop];
  }

  const [version, bump] = createSignal(0);

  const location = (): Promise<GeolocationCoordinates> => {
    version(); // tracked: invalidated by refetch() in reactive contexts
    const opts = access(options); // tracked: invalidated when options change reactively
    return new Promise<GeolocationCoordinates>((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        return reject(new Error("Geolocation is not supported."));
      }
      navigator.geolocation.getCurrentPosition(
        res => resolve(res.coords),
        error => reject(Object.assign(new Error(error.message), error)),
        mergeOptions(opts),
      );
    });
  };

  return [location, () => bump(v => v + 1)];
};

/**
 * Watches geolocation in real-time. Returns signal accessors for `location` and `error`.
 * `location` suspends on the first fix — subsequent updates flow reactively without re-suspending.
 * The watcher starts and stops reactively based on the `enabled` parameter.
 *
 * @param enabled - Whether the watcher should be active
 * @param options - Reactive position options
 * @returns `{ location, error }` — both are signal accessors
 *
 * @example
 * ```ts
 * const [enabled, setEnabled] = createSignal(true);
 * const { location, error } = createGeolocationWatcher(enabled);
 * // Suspends until first GPS fix, then updates reactively:
 * // <Suspense fallback="Acquiring GPS fix...">
 * //   <Map lat={location().latitude} lng={location().longitude} />
 * // </Suspense>
 * // Show recoverable errors without an error boundary:
 * // <Show when={error()}>Permission denied — <button onClick={retry}>retry</button></Show>
 * ```
 */
export const createGeolocationWatcher = (
  enabled: MaybeAccessor<boolean>,
  options?: MaybeAccessor<PositionOptions>,
): {
  location: Accessor<GeolocationCoordinates>;
  error: Accessor<GeolocationPositionError | null>;
} => {
  if (isServer) {
    return {
      location: () => {
        throw new Error("Geolocation is not available on the server.");
      },
      error: () => null,
    };
  }

  // Undefined initial state causes <Suspense> to hold until the first fix arrives.
  const [location, setLocation] = createSignal<GeolocationCoordinates | undefined>(undefined);
  const [error, setError] = createSignal<GeolocationPositionError | null>(null);

  let watchId: number | null = null;

  const clearWatch = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  };

  createEffect(
    () => access(enabled),
    (isEnabled) => {
      if (isEnabled) {
        watchId = navigator.geolocation.watchPosition(
          res => {
            setLocation(res.coords);
            setError(null);
          },
          err => {
            setError(err);
          },
          mergeOptions(access(options)),
        );
      } else {
        clearWatch();
      }
    },
  );

  onCleanup(clearWatch);

  // Cast: undefined initial value causes suspension until first position update.
  return {
    location: location as Accessor<GeolocationCoordinates>,
    error,
  };
};
