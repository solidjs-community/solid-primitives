import { createStaticStore } from "@solid-primitives/static-store";
import { access, MaybeAccessor } from "@solid-primitives/utils";
import type { Resource } from "solid-js";
import { createComputed, createResource, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

const geolocationDefaults: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 0,
  timeout: Number.POSITIVE_INFINITY,
};

/**
 * Generates a basic primitive to perform unary geolocation querying and updating.
 *
 * @param options - @type PositionOptions
 * @param options.enableHighAccuracy - Enable if the locator should be very accurate
 * @param options.maximumAge - Maximum cached position age
 * @param options.timeout - Amount of time before the error callback is evoked, if 0 then never
 * @return Returns a `Resource` and refetch option resolving the location coordinates, refetch function and loading value.
 *
 * @example
 * ```ts
 * const [location, refetch, loading] = createGeolocation();
 * ```
 */
export const createGeolocation = (
  options?: MaybeAccessor<PositionOptions>,
): [location: Resource<GeolocationCoordinates | undefined>, refetch: VoidFunction] => {
  if (isServer) {
    return [
      Object.assign(() => {}, { error: undefined, loading: true }) as Resource<undefined>,
      () => {
        /* noop */
      },
    ];
  }
  const [location, { refetch }] = createResource(
    () => Object.assign(geolocationDefaults, access(options)),
    options =>
      new Promise<GeolocationCoordinates>((resolve, reject) => {
        if (!("geolocation" in navigator)) {
          return reject("Geolocation is not supported.");
        }
        navigator.geolocation.getCurrentPosition(
          res => resolve(res.coords),
          error => reject(Object.assign(new Error(error.message), error)),
          options,
        );
      }),
  );
  return [location, refetch];
};

/**
 * Creates a primitive that allows for real-time geolocation watching.
 *
 * @param enabled - Specify if the location should be updated periodically (used to temporarily disable location watching)
 * @param options - @type PositionOptions
 * @param options.enableHighAccuracy - Enable if the locator should be very accurate
 * @param options.maximumAge - Maximum cached position age
 * @param options.timeout - Amount of time before the error callback is evoked, if 0 then never
 * @return Returns a location signal
 *
 * @example
 * ```ts
 * const [location, error] = createGeolocationWatcher();
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
  let registeredHandlerID: number | null;
  const clearGeolocator = () =>
    registeredHandlerID && navigator.geolocation.clearWatch(registeredHandlerID);
  // Implement as an effect to allow switching locator on/off
  createComputed(() => {
    if (access(enabled)) {
      return (registeredHandlerID = navigator.geolocation.watchPosition(
        res => setStore({ location: res.coords, error: null }),
        error => setStore({ location: null, error }),
        Object.assign(geolocationDefaults, access(options)),
      ));
    }
    clearGeolocator();
  });
  onCleanup(clearGeolocator);
  return store;
};
