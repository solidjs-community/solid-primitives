import type { Accessor, Resource, Setter } from "solid-js";
import type { StreamReturn } from "./index";

const noop = {
  stream: Object.assign(() => undefined, { loading: true, error: undefined }) as Resource<MediaStream | undefined>,
  mutate: (() => {
    /*noop*/
  }) as Setter<MediaStream | undefined>,
  refetch: () => {
    /*noop*/
  },
  stop: () => {
    /*noop*/
  }
};

export const createStream = (
  _constraints:
    | MediaDeviceInfo
    | MediaStreamConstraints
    | Accessor<MediaDeviceInfo | MediaStreamConstraints>
): StreamReturn => {
  return [new Proxy({}, {}) as Resource<undefined>, noop];
};

export const createAmplitudeStream = (
  _device: MediaDeviceInfo | Accessor<MediaDeviceInfo>
): [
  Resource<number>,
  {
    mutate: (stream: MediaStream) => void;
    refetch: () => void;
    stream: Resource<MediaStream | undefined>;
    stop: () => void;
  }
] => {
  return [new Proxy({}, {}) as Resource<number>, noop];
};

export const createMediaPermissionRequest = (
  _source?: MediaStreamConstraints | "audio" | "video"
) => {
  /*noop*/
};
