import type { Accessor, Resource } from "solid-js";
import { MaybeAccessor } from "@solid-primitives/utils";

export const createGeolocation = (
  _options?: MaybeAccessor<PositionOptions> | undefined
): [location: Resource<GeolocationCoordinates | undefined>, refetch: VoidFunction] => {
  return [
    new Proxy({}, {}) as Resource<undefined>,
    () => {
      /*noop*/
    }
  ];
};

export const createGeolocationWatcher = (
  _enabled: MaybeAccessor<boolean>,
  _options: MaybeAccessor<PositionOptions>
): {
  location: GeolocationCoordinates | null,
  error: GeolocationPositionError | null
} => {
  return {location: null, error: null};
};
