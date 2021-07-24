import type { Resource } from "solid-js";
import { createComputed, createSignal, onCleanup, createResource } from "solid-js";

export declare type LocationResourceReturn<T> = [Resource<T>, () => void, () => boolean];

/**
 * Provides a function for querying the current geolocation in browser.
 * Ported from https://github.com/imbhargav5/rooks/blob/main/src/hooks/useGeolocation.ts
 *
 * @param options - @type PositionOptions
 * @param options.enableHighAccuracy - Enable if the locator should be very accurate
 * @param options.maximumAge - Maximum cached position age
 * @param options.timeout - Amount of time before the error callback is envoked, if 0 then never
 * @return Returns arrays containing a `Resource` resolving to the location coordinates, refetch function and loading value.
 *
 * @example
 * ```ts
 * const [location, getLocation, isLoading] = createGeolocation();
 * const [location] = createGeolocation({true, 0, 100});
 * ```
 */
export const createGeolocation = (
  options: PositionOptions = {}
): LocationResourceReturn<GeolocationCoordinates | undefined> => {
  options = Object.assign(
    {
      enableHighAccuracy: false,
      maximumAge: 0,
      timeout: Number.POSITIVE_INFINITY
    },
    options
  );
  const [resource, { refetch }] = createResource(
    () =>
      new Promise<GeolocationCoordinates>((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            res => resolve(res.coords),
            error => reject({ isError: true, message: error.message }),
            options
          );
        } else {
          reject({
            isError: true,
            message: "Geolocation is not supported for this Browser/OS."
          });
        }
      })
  );
  return [resource, refetch, () => resource.loading];
};

/**
 * Provides a position watcher geolocation tracking in browser.
 * Ported from https://github.com/imbhargav5/rooks/blob/main/src/hooks/useGeolocation.ts
 *
 * @param watchPosition - Specify if the location should be updated periodically (used to temporarialy disable location watching)
 * @param options - @type PositionOptions
 * @param options.enableHighAccuracy - Enable if the locator should be very accurate
 * @param options.maximumAge - Maximum cached position age
 * @param options.timeout - Amount of time before the error callback is envoked, if 0 then never
 * @return Returns a location signal
 *
 * @example
 * ```ts
 * let location = createGeolocation();
 * let location = createGeolocation(watchLocationSignal());
 * let location = createGeolocation(true, {true, 0, 100});
 * ```
 */
export const createGeolocationWatcher = (
  watchPosition: boolean | (() => boolean) = true,
  options: PositionOptions = {}
): (() => GeolocationCoordinates | null) => {
  options = Object.assign(
    {
      enableHighAccuracy: false,
      maximumAge: 0,
      timeout: Number.POSITIVE_INFINITY
    },
    options
  );
  let registeredHandlerID: number | null;
  const [location, setLocation] = createSignal<GeolocationCoordinates | null>(null);

  // Helper to clear the geolocator
  const clearGeolocator = () =>
    registeredHandlerID && navigator.geolocation.clearWatch(registeredHandlerID);

  // Implement as an effect to allow switching locator on/off
  createComputed(() => {
    if (
      (typeof watchPosition === "function" && watchPosition()) ||
      (typeof watchPosition !== "function" && watchPosition)
    ) {
      registeredHandlerID = navigator.geolocation.watchPosition(
        res => setLocation(res.coords),
        () => setLocation(null),
        options
      );
    } else {
      clearGeolocator();
    }
  });
  onCleanup(clearGeolocator);
  return location;
};
