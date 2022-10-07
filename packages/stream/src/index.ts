import {
  Accessor,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  onCleanup,
  Resource,
  ResourceReturn,
  ResourceFetcherInfo,
  untrack
} from "solid-js";
import { FalsyValue, MaybeAccessor } from "@solid-primitives/utils";

export type ResourceActions<T, O = {}> = ResourceReturn<T, O>[1];

const constraintsFromDevice = (
  device?: MediaDeviceInfo | MediaStreamConstraints
): MediaStreamConstraints | undefined => {
  return device && "deviceId" in device
    ? {
        [device.kind === "videoinput" ? "video" : "audio"]: {
          deviceId: { exact: device.deviceId }
        }
      }
    : device;
};

const stop = (stream: MediaStream | undefined) =>
  stream?.getTracks()?.forEach(track => track.stop());

const mute = (stream: MediaStream | undefined, muted?: boolean) =>
  stream?.getTracks()?.forEach(track => {
    track.enabled = muted === false;
  });

export type StreamSourceDescription =
  | MediaDeviceInfo
  | MediaStreamConstraints
  | Accessor<MediaDeviceInfo | MediaStreamConstraints | FalsyValue>
  | FalsyValue;

export type StreamReturn = [
  stream: Resource<MediaStream | undefined>,
  controls: ResourceActions<MediaStream | undefined> & {
    /** stop the stream */
    stop: () => void;
    /** if called with false, unmute, otherwise mute the stream */
    mute: (muted?: boolean) => void;
  }
];

/**
 * Creates a reactive wrapper to get media streams from devices or screen
 * ```typescript
 * [stream, { mutate, refetch, mute, stop } = createStream(streamSource);
 * ```
 * @param streamSource MediaDeviceInfo | MediaStreamConstraints | FalsyValue | Accessor<MediaDeviceInfo | MediaStreamConstraints | FalsyValue>
 * @returnValue `stream()` is an accessor to the media stream (or undefined if not yet loaded)
 * @property `stream.loading` is a boolean indicator for the loading state
 * @property `stream.error` contains any error getting the stream encountered
 * @method `mutate` allows to manually overwrite the stream
 * @method `refetch` allows to restart the request without changing the constraints
 * @method `mute` will mute the stream or unmute if called with `false`
 * @method `stop` allows stopping the media stream
 *
 * The stream will be stopped on cleanup automatically.
 */
export const createStream = (streamSource: StreamSourceDescription): StreamReturn => {
  const [stream, { mutate, refetch }] = createResource(
    createMemo<MediaStreamConstraints | undefined>(() =>
      constraintsFromDevice(
        (typeof streamSource === "function" ? streamSource() : streamSource) || undefined
      )
    ),
    (constraints, info: ResourceFetcherInfo<MediaStream>): Promise<MediaStream> =>
      navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        if (info.value && stream !== info.value) {
          stop(info.value);
        }
        return stream;
      })
  );

  onCleanup(() => stop(stream()));
  return [
    stream,
    {
      mutate,
      refetch,
      mute: (muted?: boolean) => mute(untrack(stream), muted),
      stop: () => stop(untrack(stream))
    }
  ];
};

/**
 * Creates a reactive signal containing the amplitude of a microphone
 * ```typescript
 * [amplitude, { stream, mutate, refetch, stop }] = createAmplitudeStream(streamSource);
 * ```
 * @param streamSource MediaDeviceInfo | MediaStreamConstraints | FalsyValue | Accessor<MediaDeviceInfo | MediaStreamConstraints | FalsyValue>
 * @property `amplitude()` allows access the amplitude as a number between 0 and 100
 * @property `amplitude.loading` is a boolean indicator for the loading state of the underlying stream
 * @property `amplitude.error` contains any error getting the stream encountered
 * @property `amplitude.stream()` is an accessor to allow access to the stream
 * @method `mutate` allows to manually overwrite the microphone stream
 * @method `refetch` allows to restart the request without changing the device
 * @method `stop` allows stopping the media stream
 *
 * The stream will be stopped on cleanup automatically.
 */
export const createAmplitudeStream = (
  streamSource?: StreamSourceDescription
): [
  Resource<number>,
  {
    mutate: (stream: MediaStream) => void;
    refetch: () => void;
    stream: Resource<MediaStream | undefined>;
    stop: () => void;
  }
] => {
  const [stream, { mutate, refetch, stop }] = createStream(streamSource);
  const [amplitude, amplitudeStop] = createAmplitudeFromStream(stream);

  const teardown = () => {
    amplitudeStop();
    stop();
  };
  onCleanup(teardown);

  return [
    Object.defineProperties(amplitude, {
      error: { get: () => stream.error },
      loading: { get: () => stream.loading }
    }) as Resource<number>,
    { stream, mutate, refetch, stop: teardown }
  ];
};

/**
 * Creates a reactive signal containing the amplitude of a microphone
 * ```typescript
 * [amplitude, stop] = createAmplitudeFromStream(stream);
 * ```
 * @param stream MaybeAccessor<MediaStream | undefined>
 * @return `amplitude()` allows access the amplitude as a number between 0 and 100
 * @return `stop()` allows stopping the amplitude
 *
 * The amplitude will be stopped on cleanup automatically.
 */
export const createAmplitudeFromStream = (
  stream: MaybeAccessor<MediaStream | undefined>
): [amplitude: Accessor<number>, stop: () => void] => {
  const [amplitude, setAmplitude] = createSignal(0);
  const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();
  Object.assign(analyser, {
    fftSize: 128,
    minDecibels: -60,
    maxDecibels: -10,
    smoothingTimeConstant: 0.8
  });

  let source: MediaStreamAudioSourceNode;
  createEffect(() => {
    const currentStream = typeof stream === "function" ? stream() : stream;
    if (currentStream !== undefined) {
      ctx.resume();
      source?.disconnect();
      source = ctx.createMediaStreamSource(currentStream);
      source.connect(analyser);
    }
  });

  const buffer = new Uint8Array(analyser.frequencyBinCount);
  const read = () => {
    analyser.getByteFrequencyData(buffer);
    const rootMeanSquare =
      Math.sqrt(buffer.reduce((sum, v) => sum + v * v, 0) / buffer.length) << 2;
    setAmplitude(rootMeanSquare > 100 ? 100 : rootMeanSquare);
  };
  let id: number;
  const loop = () => {
    id = requestAnimationFrame(loop);
    read();
  };
  loop();

  onCleanup(() => cancelAnimationFrame(id));

  const teardown = () => {
    source?.disconnect();
    if (ctx.state !== "closed") {
      ctx.close();
    }
  };
  onCleanup(teardown);

  return [amplitude, teardown];
};

/**
 * Creates a reactive wrapper to get display media streams from screen
 * ```typescript
 * [stream, { mutate, refetch, mute, stop } = createScreen(screenSource);
 * ```
 * @param screenSource DisplayMediaStreamConstraints | undefined | Accessor<DisplayMediaStreamConstraints | undefined>
 * @returnValue `stream()` is an accessor to the display media stream (or undefined if not yet loaded)
 * @property `stream.loading` is a boolean indicator for the loading state
 * @property `stream.error` contains any error getting the stream encountered
 * @method `mutate` allows to manually overwrite the stream
 * @method `refetch` allows to restart the request without changing the constraints
 * @method `mute` will mute the stream or unmute if called with `false`
 * @method `stop` allows stopping the display media stream
 *
 * The stream will be stopped on cleanup automatically.
 */
 export const createScreen = (screenSource: MaybeAccessor<DisplayMediaStreamConstraints | undefined>): StreamReturn => {
  const [stream, { mutate, refetch }] = createResource(
    createMemo<DisplayMediaStreamConstraints | undefined>(() =>
      typeof screenSource === "function" ? screenSource() : screenSource || undefined
    ),
    (constraints, info: ResourceFetcherInfo<MediaStream>): Promise<MediaStream> =>
      navigator.mediaDevices.getDisplayMedia(constraints).then(stream => {
        if (info.value && stream !== info.value) {
          stop(info.value);
        }
        return stream;
      })
  );

  onCleanup(() => stop(stream()));
  return [
    stream,
    {
      mutate,
      refetch,
      mute: (muted?: boolean) => mute(untrack(stream), muted),
      stop: () => stop(untrack(stream))
    }
  ];
};

/**
 * Creates an initial user media request that will be stopped immediately in order to request permissions from the user
 * ```typescript
 * createMediaPermissionRequest('audio');
 * ```
 * @param source MediaStreamConstraints | 'audio' | 'video' | undefined
 *
 * If no source is given, both microphone and camera permissions will be requested. You can read the permissions with the `createPermission` primitive from the `@solid-primitives/permission` package.
 */
export const createMediaPermissionRequest = (source?: MediaStreamConstraints | "audio" | "video") =>
  navigator.mediaDevices
    .getUserMedia(
      source
        ? typeof source === "string"
          ? { [source]: true }
          : source
        : { audio: true, video: true }
    )
    .then(stop);
