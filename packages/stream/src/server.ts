import type { Accessor, Resource, Setter } from "solid-js";
import type { StreamReturn, StreamSourceDescription } from "./index";

const noop = {
  stream: Object.assign(() => undefined, { loading: true, error: undefined }) as Resource<
    MediaStream | undefined
  >,
  mutate: (() => {
    /*noop*/
  }) as Setter<MediaStream | undefined>,
  refetch: () => {
    /*noop*/
  },
  mute: () => {
    /*noop*/
  },
  stop: () => {
    /*noop*/
  }
};

export const createStream = (
  _sourceDescription: StreamSourceDescription
): StreamReturn => {
  return [new Proxy({}, {}) as Resource<undefined>, noop as any];
};

export const createAmplitudeStream = (
  _sourceDescription: StreamSourceDescription
): [
  Resource<number>,
  {
    mutate: (stream: MediaStream) => void;
    refetch: () => void;
    stream: Resource<MediaStream | undefined>;
    mute: () => void;
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
