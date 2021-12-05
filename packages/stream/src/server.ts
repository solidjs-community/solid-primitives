import type { Accessor, Resource } from "solid-js";
import type { StreamReturn } from "./index";

const noop = {
  stream: new Proxy({}, {}) as Resource<undefined>,
  mutate: () => {
    /*noop*/
  },
  refetch: () => {
    /*noop*/
  },
  stop
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
