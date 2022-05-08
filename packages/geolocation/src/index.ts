import type { Accessor, Resource } from "solid-js";
import { createComputed, batch, createSignal, onCleanup, createResource } from "solid-js";
import { MaybeAccessor } from "@solid-primitives/utils";

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
 * @return Returns arrays containing a `Resource` resolving to the location coordinates, refetch function and loading value.
 *
 * @example
 * ```ts
 * const [location, refetch, loading] = createGeolocation();
 * ```
 */
export const createGeolocation = (
  options: PositionOptions = {}
): [location: Resource<GeolocationCoordinates | undefined>, refetch: Accessor<void>] => {
  options = Object.assign(geolocationDefaults, options);
  const [location, { refetch }] = createResource(() => {
    return new Promise<GeolocationCoordinates>((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        return reject({ code: null, message: "Geolocation is not defined." });
      }
      navigator.geolocation.getCurrentPosition(res => resolve(res.coords), reject, options);
    });
  });
  return [location, refetch];
};

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
  options: PositionOptions = {}
): [
  location: Accessor<GeolocationCoordinates | null>,
  error: Accessor<GeolocationPositionError | null>
] => {
  options = Object.assign(geolocationDefaults, options);
  const [location, setLocation] = createSignal<GeolocationCoordinates | null>(null);
  const [error, setError] = createSignal<GeolocationPositionError | null>(null);
  let registeredHandlerID: number | null;
  const clearGeolocator = () =>
    registeredHandlerID && navigator.geolocation.clearWatch(registeredHandlerID);
  // Implement as an effect to allow switching locator on/off
  createComputed(() => {
    if (
      (enabled instanceof Function && enabled()) ||
      (enabled instanceof Function && enabled)
    ) {
      return (registeredHandlerID = navigator.geolocation.watchPosition(
        res => batch(() => [setLocation(res.coords), error() && setError(null)]),
        error => batch(() => [setLocation(null), setError(error)]),
        options
      ));
    }
    clearGeolocator();
  });
  onCleanup(clearGeolocator);
  return [location, error];
};
