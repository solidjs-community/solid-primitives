
import { createEffect, createSignal, onCleanup } from 'solid-js';

/**
 * Provides a set of utilities for geolocation tracking in browser.
 * Ported from https://github.com/imbhargav5/rooks/blob/main/src/hooks/useGeolocation.ts
 *
 * @param watchPosition - Specify if the location should be updated periodically
 * @param options - @type PositionOptions
 * @param options.enableHighAccuracy - Enable if the locator should be very accurate
 * @param options.maximumAge - Maximum cached position age
 * @param options.timeout - Amount of time before the error callback is envoked, if 0 then never
 * @return Returns a location signal and one-off async query callback
 * 
 * @example
 * ```ts
 * let [location] = createGeolocation(true);
 * let [location, getLocation] = createGeolocation(true, {true, 0, 100});
 * ```
 */
const createGeolocation = (
  watchPosition: boolean | (() => boolean),
  options: PositionOptions = {},
): [
    location: () => GeolocationCoordinates | null,
    getLocation: () => Promise<GeolocationCoordinates>
  ] => {
  options = Object.assign({
    enableHighAccuracy: false,
    maximumAge: 0,
    timeout: Number.POSITIVE_INFINITY
  }, options);
  let registeredHandlerID: number | null;
  const [location, setLocation] = createSignal<GeolocationCoordinates | null>(
    null
  );

  // Helper to retrieve the current location synchronously
  const getLocation = (): Promise<GeolocationCoordinates> =>
    new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (res) => {
            setLocation(res.coords);
            resolve(res.coords);
          },
          (error) => reject({ isError: true, message: error.message }),
          options
        );
      } else {
        reject({
          isError: true,
          message: "Geolocation is not supported for this Browser/OS."
        });
      }
    });
  // Helper to clear the geolocator
  const clearGeolocator = () =>
    registeredHandlerID && navigator.geolocation.clearWatch(registeredHandlerID);

  // Implement as an effect to allow switching locator on/off
  createEffect(() => {
    if (
      (typeof watchPosition === "function" && watchPosition()) ||
      (typeof watchPosition !== "function" && watchPosition)
    ) {
      registeredHandlerID = navigator.geolocation.watchPosition(
        (res) => setLocation(res.coords),
        () => setLocation(null), // Maybe we should throw an error as well?
        options
      );
    } else {
      clearGeolocator();
    }
  });
  onCleanup(clearGeolocator);

  return [location, getLocation];
};

export default createGeolocation;
