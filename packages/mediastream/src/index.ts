import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
} from "solid-js";
import { isServer } from "@solidjs/web";
import {
  access,
  noop,
  INTERNAL_OPTIONS,
  type FalsyValue,
  type MaybeAccessor,
} from "@solid-primitives/utils";

const constraintsFromDevice = (
  device?: MediaDeviceInfo | MediaStreamConstraints,
): MediaStreamConstraints | undefined => {
  return device && "deviceId" in device
    ? {
        [device.kind === "videoinput" ? "video" : "audio"]: {
          deviceId: { exact: device.deviceId },
        },
      }
    : device;
};

const stopStream = (stream: MediaStream | undefined) =>
  stream?.getTracks().forEach(track => track.stop());

const muteStream = (stream: MediaStream | undefined, muted?: boolean) =>
  stream?.getTracks().forEach(track => {
    track.enabled = muted === false;
  });

export type StreamSourceDescription =
  | MediaDeviceInfo
  | MediaStreamConstraints
  | Accessor<MediaDeviceInfo | MediaStreamConstraints | FalsyValue>
  | FalsyValue;

export type StreamControls = {
  /** stop the stream */
  stop: () => void;
  /** if called with false, unmute, otherwise mute the stream */
  mute: (muted?: boolean) => void;
};

export type StreamReturn = [stream: Accessor<MediaStream | undefined>, controls: StreamControls];

/**
 * Creates a reactive wrapper to get media streams from devices.
 * ```typescript
 * const [stream, { mute, stop }] = createStream(streamSource);
 * ```
 * @param streamSource MediaDeviceInfo | MediaStreamConstraints | FalsyValue | Accessor<...>
 * @returns `stream()` — accessor to the current MediaStream (undefined while loading or stopped)
 * @method `mute` mutes the stream, or unmutes when called with `false`
 * @method `stop` stops the stream immediately
 *
 * Wrap in `<Loading>` to handle the async pending state. The stream stops automatically on cleanup.
 */
export const createStream = (streamSource: StreamSourceDescription): StreamReturn => {
  if (isServer) {
    return [() => undefined, { stop: noop, mute: noop }];
  }

  const [stream, setStream] = createSignal<MediaStream | undefined>(undefined, INTERNAL_OPTIONS);

  const constraints = createMemo(() =>
    constraintsFromDevice(access(streamSource) || undefined),
  );

  createEffect(
    () => constraints(),
    c => {
      let active = true;
      stopStream(untrack(stream));

      if (c) {
        navigator.mediaDevices.getUserMedia(c).then(s => {
          if (active) setStream(s);
          else stopStream(s);
        });
      } else {
        setStream(undefined);
      }

      return () => {
        active = false;
      };
    },
  );

  onCleanup(() => stopStream(untrack(stream)));

  return [
    stream,
    {
      mute: (muted?: boolean) => muteStream(untrack(stream), muted),
      stop: () => stopStream(untrack(stream)),
    },
  ];
};

/**
 * Creates a reactive signal with the RMS amplitude (0–100) from a microphone stream.
 * ```typescript
 * const [amplitude, stop] = createAmplitudeFromStream(stream);
 * ```
 * @param stream MaybeAccessor<MediaStream | undefined>
 * @returns `amplitude()` — number between 0 and 100
 * @returns `stop()` — stop the amplitude measurement
 *
 * The amplitude measurement stops automatically on cleanup.
 */
export const createAmplitudeFromStream = (
  stream: MaybeAccessor<MediaStream | undefined>,
): [amplitude: Accessor<number>, stop: () => void] => {
  if (isServer) {
    return [() => 0, noop];
  }

  const [amplitude, setAmplitude] = createSignal(0, INTERNAL_OPTIONS);
  const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();
  Object.assign(analyser, {
    fftSize: 128,
    minDecibels: -60,
    maxDecibels: -10,
    smoothingTimeConstant: 0.8,
  });

  let source: MediaStreamAudioSourceNode | undefined;

  createEffect(
    () => access(stream),
    currentStream => {
      if (currentStream !== undefined) {
        ctx.resume();
        source?.disconnect();
        source = ctx.createMediaStreamSource(currentStream);
        source.connect(analyser);
      }
    },
  );

  const buffer = new Uint8Array(analyser.frequencyBinCount);
  const read = () => {
    analyser.getByteFrequencyData(buffer);
    const rootMeanSquare =
      Math.sqrt(buffer.reduce((sum, v) => sum + v * v, 0) / buffer.length) << 2;
    setAmplitude(rootMeanSquare > 100 ? 100 : rootMeanSquare);
  };

  let rafId: number;
  const loop = () => {
    rafId = requestAnimationFrame(loop);
    read();
  };
  loop();

  const stop = () => {
    source?.disconnect();
    if (ctx.state !== "closed") {
      ctx.close();
    }
  };

  onCleanup(() => cancelAnimationFrame(rafId));
  onCleanup(stop);

  return [amplitude, stop];
};

/**
 * Creates a reactive signal with the RMS amplitude (0–100) from a microphone device.
 * ```typescript
 * const [amplitude, { stream, stop }] = createAmplitudeStream(streamSource);
 * ```
 * @param streamSource MediaDeviceInfo | MediaStreamConstraints | FalsyValue | Accessor<...>
 * @returns `amplitude()` — number between 0 and 100
 * @property `stream` — accessor to the underlying MediaStream
 * @method `stop` — stop the stream and amplitude measurement
 *
 * The stream stops automatically on cleanup.
 */
export const createAmplitudeStream = (
  streamSource?: StreamSourceDescription,
): [
  amplitude: Accessor<number>,
  controls: {
    stream: Accessor<MediaStream | undefined>;
    stop: () => void;
  },
] => {
  const [stream, streamControls] = createStream(streamSource);
  const [amplitude, amplitudeStop] = createAmplitudeFromStream(stream);

  const teardown = () => {
    amplitudeStop();
    streamControls.stop();
  };
  onCleanup(teardown);

  return [amplitude, { stream, stop: teardown }];
};

declare global {
  interface DisplayMediaStreamConstraints {
    audio?: boolean | MediaTrackConstraints;
    video?: boolean | MediaTrackConstraints;
  }
}

/**
 * Creates a reactive wrapper to capture a display media stream (screen/window/tab).
 * ```typescript
 * const [stream, { mute, stop }] = createScreen(screenSource);
 * ```
 * @param screenSource DisplayMediaStreamConstraints | undefined | Accessor<...>
 * @returns `stream()` — accessor to the current display MediaStream (undefined while loading or stopped)
 * @method `mute` mutes the stream, or unmutes when called with `false`
 * @method `stop` stops the stream immediately
 *
 * Wrap in `<Loading>` to handle the async pending state. The stream stops automatically on cleanup.
 */
export const createScreen = (
  screenSource: MaybeAccessor<DisplayMediaStreamConstraints | undefined>,
): StreamReturn => {
  if (isServer) {
    return [() => undefined, { stop: noop, mute: noop }];
  }

  const [stream, setStream] = createSignal<MediaStream | undefined>(undefined, INTERNAL_OPTIONS);

  createEffect(
    () => access(screenSource),
    constraints => {
      let active = true;
      stopStream(untrack(stream));

      if (constraints) {
        navigator.mediaDevices.getDisplayMedia(constraints).then(s => {
          if (active) setStream(s);
          else stopStream(s);
        });
      } else {
        setStream(undefined);
      }

      return () => {
        active = false;
      };
    },
  );

  onCleanup(() => stopStream(untrack(stream)));

  return [
    stream,
    {
      mute: (muted?: boolean) => muteStream(untrack(stream), muted),
      stop: () => stopStream(untrack(stream)),
    },
  ];
};

/**
 * Requests media permissions from the user by opening and immediately stopping a stream.
 * ```typescript
 * createMediaPermissionRequest('audio');
 * ```
 * @param source MediaStreamConstraints | 'audio' | 'video' | undefined
 *
 * If no source is given, both microphone and camera permissions will be requested.
 * Read the resulting permissions with `createPermission` from `@solid-primitives/permission`.
 */
export const createMediaPermissionRequest = (
  source?: MediaStreamConstraints | "audio" | "video",
): Promise<void> => {
  if (isServer) {
    return Promise.resolve();
  }
  return navigator.mediaDevices
    .getUserMedia(
      source
        ? typeof source === "string"
          ? { [source]: true }
          : source
        : { audio: true, video: true },
    )
    .then(stream => stopStream(stream));
};
