import type { Accessor, Resource } from "solid-js";

export const createGeolocation = (
  _options: PositionOptions = {}
): [location: Resource<GeolocationCoordinates | undefined>, refetch: Accessor<void>] => {
  return [
    new Proxy({}, {}) as Resource<undefined>,
    () => {
      /*noop*/
    }
  ];
};

export const createGeolocationWatcher = (
  _enabled: boolean | (() => boolean) = true,
  _options: PositionOptions = {}
): [
  location: Accessor<GeolocationCoordinates | null>,
  error: Accessor<GeolocationPositionError | null>
] => {
  return [() => null, () => null];
};
