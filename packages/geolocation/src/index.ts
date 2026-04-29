import { isServer } from "solid-js/web";
import { type Accessor, createEffect, createSignal, NotReadyError, onCleanup } from "solid-js";
import { access, noop, type MaybeAccessor } from "@solid-primitives/utils";

const geolocationDefaults: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 0,
  timeout: Number.POSITIVE_INFINITY,
};

const mergeOptions = (options?: PositionOptions): PositionOptions =>
  Object.assign({}, geolocationDefaults, options);

// Sentinel for the "not yet observed" pending state.
const NOT_SET: unique symbol = Symbol();

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
 * until the position resolves, integrating with `<Loading>` boundaries.
 * Re-queries when `options` changes or when `refetch` is called.
 *
 * @param options - Reactive position options
 * @returns Tuple of `[location, refetch]`
 *
 * @example
 * ```ts
 * const [location, refetch] = createGeolocation();
 * // In JSX — suspends until first fix:
 * // <Loading fallback="Locating...">
 * //   <div>{location().latitude}, {location().longitude}</div>
 * // </Loading>
 * // Check if re-querying in the background:
 * // <Show when={isPending(() => location())}>Updating...</Show>
 * ```
 */
export const createGeolocation = (
  options?: MaybeAccessor<PositionOptions>,
): [location: () => Promise<GeolocationCoordinates>, refetch: VoidFunction] => {
  if (isServer) {
    const stub = () => {
      throw new NotReadyError("Geolocation is not available on the server.");
    };
    return [stub as () => Promise<GeolocationCoordinates>, noop];
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
 * `location` throws `NotReadyError` (integrating with `<Loading>`) until the first GPS fix
 * arrives — subsequent updates flow reactively without re-suspending. The watcher starts
 * and stops reactively based on `enabled`. Reactive `options` restarts the watcher.
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
 * // <Loading fallback="Acquiring GPS fix...">
 * //   <Map lat={location().latitude} lng={location().longitude} />
 * // </Loading>
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
        throw new NotReadyError("Geolocation is not available on the server.");
      },
      error: () => null,
    };
  }

  // NOT_SET causes location() to throw NotReadyError until the first fix —
  // integrates with <Loading> for a natural pending state.
  const [rawLocation, setLocation] = createSignal<GeolocationCoordinates | typeof NOT_SET>(NOT_SET);
  const [error, setError] = createSignal<GeolocationPositionError | null>(null);

  // Plain wrapper: throws NotReadyError when pending, returns coordinates when set.
  // Using a plain function (not a computed signal) avoids caching issues outside
  // a reactive scope between state transitions.
  const location = (): GeolocationCoordinates => {
    const val = rawLocation();
    if (val === NOT_SET) throw new NotReadyError("Waiting for first GPS fix");
    return val;
  };

  let watchId: number | null = null;

  const clearWatch = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  };

  createEffect(
    // Track both enabled and options. When enabled is false, options is not
    // evaluated (short-circuit) — so option changes only re-run when active.
    () => (access(enabled) ? access(options) : (false as const)),
    (optsOrFalse) => {
      clearWatch();
      if (optsOrFalse !== false) {
        watchId = navigator.geolocation.watchPosition(
          res => {
            setLocation(res.coords);
            setError(null);
          },
          err => {
            setError(err);
          },
          mergeOptions(optsOrFalse),
        );
      }
    },
  );

  onCleanup(clearWatch);

  return { location, error };
};
