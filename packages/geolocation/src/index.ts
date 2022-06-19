import type { Resource } from "solid-js";
import { createComputed, onCleanup, createResource } from "solid-js";
import { access, MaybeAccessor, createStaticStore } from "@solid-primitives/utils";

const geolocationDefaults: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 0,
  timeout: Number.POSITIVE_INFINITY
};

/**
 * Generates a basic primitive to perform unary geolocation querying and updating.
 *
 * @param options - @type PositionOptions
 * @param options.enableHighAccuracy - Enable if the locator should be very accurate
 * @param options.maximumAge - Maximum cached position age
 * @param options.timeout - Amount of time before the error callback is envoked, if 0 then never
 * @return Returns a `Resource` and refetch option resolving the location coordinates, refetch function and loading value.
 *
 * @example
 * ```ts
 * const [location, refetch, loading] = createGeolocation();
 * ```
 */
export const createGeolocation = (
  options?: MaybeAccessor<PositionOptions>
): [location: Resource<GeolocationCoordinates | undefined>, refetch: VoidFunction] => {
  const [location, {refetch}] = createResource(
    () => Object.assign(geolocationDefaults, access(options)),
    (options) => new Promise<GeolocationCoordinates>(
      (resolve, reject) => {
        if (!("geolocation" in navigator)) {
          return reject({ code: null, message: "Geolocation is not defined." });
        }
        navigator.geolocation.getCurrentPosition(res => resolve(res.coords), reject, options);
      }
    )
  );
  return [location, refetch];
}

/**
 * Creates a primitive that allows for real-time geolocation watching.
 *
 * @param enabled - Specify if the location should be updated periodically (used to temporarialy disable location watching)
 * @param options - @type PositionOptions
 * @param options.enableHighAccuracy - Enable if the locator should be very accurate
 * @param options.maximumAge - Maximum cached position age
 * @param options.timeout - Amount of time before the error callback is envoked, if 0 then never
 * @return Returns a location signal
 *
 * @example
 * ```ts
 * const [location, error] = createGeolocationWatcher();
 * ```
 */
export const createGeolocationWatcher = (
  enabled: MaybeAccessor<boolean>,
  options?: MaybeAccessor<PositionOptions>
): {
  location: GeolocationCoordinates | null,
  error: GeolocationPositionError | null
} => {
  const [store, setStore] = createStaticStore<{
    location: null | GeolocationCoordinates,
    error: null | GeolocationPositionError
  }>({
    location: null,
    error: null
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
        Object.assign(geolocationDefaults, access(options))
      ));
    }
    clearGeolocator();
  });
  onCleanup(clearGeolocator);
  return store;
};
