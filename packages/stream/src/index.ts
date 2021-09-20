import {
  Accessor,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  onCleanup,
  Resource
} from "solid-js";

const constraintsFromDevice = (
  device: MediaDeviceInfo | MediaStreamConstraints
): MediaStreamConstraints => {
  return "deviceId" in device
    ? {
        [device.kind === "videoinput" ? "video" : "audio"]: {
          deviceId: { exact: device.deviceId }
        }
      }
    : device;
};

const stop = (stream: Accessor<MediaStream | undefined>) =>
  stream()
    ?.getTracks()
    ?.forEach((track) => track.stop());

export type StreamReturn = [
  stream: Resource<MediaStream | undefined>,
  controls: {
    mutate: (stream: MediaStream) => void;
    refetch: () => void;
    stop: () => void;
  }
];

/**
 * Creates a reactive wrapper to get media streams from devices or screen
 * ```typescript
 * [stream, { mutate, refetch, stop } = createStream(constraints);
 * ```
 * @param constraints MediaDeviceInfo | MediaStreamConstraints | Accessor<MediaDeviceInfo | MediaStreamConstraints>
 * @property `stream()` allows access to the media stream (or undefined if none is present)
 * @property `stream.loading` is a boolean indicator for the loading state
 * @property `stream.error` contains any error getting the stream encountered
 * @method `mutate` allows to manually overwrite the stream
 * @method `refetch` allows to restart the request without changing the constraints
 * @method `stop` allows stopping the media stream
 * 
 * The stream will be stopped on cleanup automatically.
 */
export const createStream = (
  constraints: MediaDeviceInfo | MediaStreamConstraints | Accessor<MediaDeviceInfo | MediaStreamConstraints>
): StreamReturn => {
  const [stream, { mutate, refetch }] = createResource<
    MediaStream,
    MediaStreamConstraints
  >(
    createMemo<MediaStreamConstraints>(() =>
      constraintsFromDevice(typeof constraints === 'function' ? constraints() : constraints)
    ),
    (
      constraints,
      prev: Accessor<MediaStream | undefined>
    ): Promise<MediaStream> =>
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        if (stream !== prev()) {
          stop(prev);
        }
        return stream;
      })
  );

  onCleanup(() => stop(stream));
  return [stream, { mutate, refetch, stop: () => stop(stream) }];
};

/**
 * Creates a reactive signal containing the amplitude of a microphone
 * ```typescript
 * [amplitude, { mutate, refetch, stop }] = createAmplitudeStream(device);
 * ```
 * @param device MediaDeviceInfo | Accessor<MediaDeviceInfo>
 * @param constraints MediaDeviceInfo | MediaStreamConstraints | Accessor<MediaDeviceInfo | MediaStreamConstraints>
 * @property `amplitude()` allows access to the media stream (or undefined if none is present)
 * @property `amplitude.loading` is a boolean indicator for the loading state of the underlying stream
 * @property `amplitude.error` contains any error getting the stream encountered
 * @method `mutate` allows to manually overwrite the microphone stream
 * @method `refetch` allows to restart the request without changing the device
 * @method `stop` allows stopping the media stream
 * 
 * The stream will be stopped on cleanup automatically.
 */
export const createAmplitudeStream = (
  device: MediaDeviceInfo | Accessor<MediaDeviceInfo>
): [
  Resource<number>,
  {
    mutate: (stream: MediaStream) => void,
    refetch: () => void,
    stream: Resource<MediaStream | undefined>,
    stop: () => void
  }
] => {
  const [amplitude, setAmplitude] = createSignal(0);
  const [stream, { mutate, refetch, stop }] = createStream(device);
  const ctx = new AudioContext({ sampleRate: 8000 });
  const analyser = ctx.createAnalyser();
  Object.assign(analyser, {
    fftSize: 128,
    minDecibels: -60,
    maxDecibels: -10,
    smoothingTimeConstant: 0.8
  });

  let source: MediaStreamAudioSourceNode;
  createEffect(() => {
    const currentStream = stream()
    if (currentStream !== undefined) {
      source?.disconnect();
      source = ctx.createMediaStreamSource(currentStream);
      source.connect(analyser);
    }
  });

  const buffer = new Uint8Array(analyser.frequencyBinCount);
  const read = () => {
    analyser.getByteFrequencyData(buffer);
    setAmplitude(
      Math.sqrt(buffer.reduce((sum, v) => sum + v * v, 0) / buffer.length)
    );
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
 * Creates an initial user media request that will be stopped immediately in order to request permissions from the user
 * ```typescript
 * createMediaPermissionRequest('audio');
 * ```
 * @param source MediaStreamConstraints | 'audio' | 'video' | undefined
 * 
 * If no source is given, both microphone and camera permissions will be requested. You can read the permissions with the `createPermission` primitive.
 */
export const createMediaPermissionRequest = (
  source?: MediaStreamConstraints | "audio" | "video"
) =>
  navigator.mediaDevices
    .getUserMedia(
      source
        ? typeof source === "string"
          ? { [source]: true }
          : source
        : { audio: true, video: true }
    )
    .then((stream) => stream?.getTracks()?.forEach((track) => track.stop()));
