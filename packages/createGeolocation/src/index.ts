
import { createEffect, createSignal } from 'solid-js';

/**
 * Provides a set of utilities for geolocation tracking in browser.
 * Ported from https://github.com/imbhargav5/rooks/blob/main/src/hooks/useGeolocation.ts
 *
 * @param callback - Function that will be called every `delay` ms
 * @param delay - Number representing the delay in ms
 * @param schedule - Specify the schedule you'd like to use or supply a custom function
 * @return Provides a manual clear/end function.
 * 
 * @example
 * ```ts
 * let [count, setCount] = createGeolocation(0);
 * ```
 */

 type GeolocationDetail = {
  lat?: number;
  lng?: number;
  isError: boolean;
  message: string;
};

type IOptions = {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  when?: boolean;
};

// Helper method
const getGeoLocation = (options: IOptions): Promise<GeolocationDetail> => (
  new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (res) => {
          const { coords } = res;
          const { latitude, longitude } = coords;
          resolve({
            isError: false,
            lat: latitude,
            lng: longitude,
            message: '',
          });
        },
        (error) => {
          reject({ isError: true, message: error.message });
        },
        options
      );
    } else {
      reject({
        isError: true,
        message: 'Geolocation is not supported for this Browser/OS.',
      });
    }
  })
);

const defaultGeoLocationOptions = {
  enableHighAccuracy: false,
  maximumAge: 0,
  timeout: Number.POSITIVE_INFINITY,
  when: true,
};

const useGeolocation = (
  geoLocationOptions: IOptions = defaultGeoLocationOptions
): GeolocationDetail | null => {
  const [geoObject, setGeoObject] = createSignal<GeolocationDetail | null>(null);
  const { when, enableHighAccuracy, timeout, maximumAge } = geoLocationOptions;
  const getGeoCode = async () => {
    try {
      const value = await getGeoLocation({
        enableHighAccuracy,
        maximumAge,
        timeout,
        when,
      });
      setGeoObject(value);
    } catch (error) {
      setGeoObject(error);
    }
  }

  createEffect(() => {
    if (when) {
      getGeoCode();
    }
  });

  return geoObject;
}

export { useGeolocation };