import {
  type Accessor,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";
import { isServer } from "solid-js/web";
import { access, type MaybeAccessor } from "@solid-primitives/utils";

export interface AudioContextOptions extends AudioContextOptions {
  autoSuspendOnHidden?: boolean;
}

export function createAudioContext(
  options: AudioContextOptions = {},
): [
  AudioContext | null,
  {
    state: Accessor<AudioContextState>;
    resume: () => Promise<void>;
    suspend: () => Promise<void>;
    close: () => Promise<void>;
  },
] {
  if (isServer || typeof window === "undefined" || !("AudioContext" in window || "webkitAudioContext" in window)) {
    const noopState: Accessor<AudioContextState> = () => "suspended";
    return [
      null,
      {
        state: noopState,
        resume: async () => {},
        suspend: async () => {},
        close: async () => {},
      },
    ];
  }

  const AudioCtxConstructor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtxConstructor(options);
  const [state, setState] = createSignal<AudioContextState>(ctx.state);

  const updateState = () => setState(ctx.state);

  ctx.addEventListener("statechange", updateState);

  if (options.autoSuspendOnHidden ?? true) {
    const onVisibilityChange = () => {
      if (document.hidden) {
        if (ctx.state === "running") {
          void ctx.suspend();
        }
      } else {
        if (ctx.state === "suspended") {
          void ctx.resume();
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    onCleanup(() => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    });
  }

  onCleanup(() => {
    ctx.removeEventListener("statechange", updateState);
    if (ctx.state !== "closed") {
      void ctx.close();
    }
  });

  return [
    ctx,
    {
      state,
      resume: () => ctx.resume().then(updateState),
      suspend: () => ctx.suspend().then(updateState),
      close: () => ctx.close().then(updateState),
    },
  ];
}

export type RampMode = "instant" | "linear" | "exponential";

export interface AudioParamOptions {
  ramp?: RampMode;
  timeConstant?: number;
}

export function createAudioParam(
  param: AudioParam,
  value: MaybeAccessor<number>,
  options: AudioParamOptions = {},
): void {
  if (isServer) return;

  const ramp = options.ramp ?? "linear";
  const timeConstant = options.timeConstant ?? 0.05;

  createEffect(() => {
    const target = access(value);
    if (typeof target !== "number" || isNaN(target)) return;

    const now = param.context.currentTime;

    if (ramp === "instant" || timeConstant <= 0) {
      param.setValueAtTime(target, now);
    } else if (ramp === "exponential") {
      const safeTarget = Math.max(target, 0.00001);
      param.cancelScheduledValues(now);
      param.setValueAtTime(Math.max(param.value, 0.00001), now);
      param.exponentialRampToValueAtTime(safeTarget, now + timeConstant);
    } else {
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value, now);
      param.linearRampToValueAtTime(target, now + timeConstant);
    }
  });
}

export interface AnalyserOptions {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
}

export function createAudioAnalyser(
  ctx: AudioContext,
  source: AudioNode,
  options: AnalyserOptions = {},
): {
  analyser: AnalyserNode;
  getByteFrequencyData: () => Uint8Array;
  getFloatFrequencyData: () => Float32Array;
  getByteTimeDomainData: () => Uint8Array;
  getFloatTimeDomainData: () => Float32Array;
} {
  const analyser = ctx.createAnalyser();
  if (options.fftSize) analyser.fftSize = options.fftSize;
  if (options.smoothingTimeConstant !== undefined) analyser.smoothingTimeConstant = options.smoothingTimeConstant;
  if (options.minDecibels !== undefined) analyser.minDecibels = options.minDecibels;
  if (options.maxDecibels !== undefined) analyser.maxDecibels = options.maxDecibels;

  source.connect(analyser);

  const binCount = analyser.frequencyBinCount;
  const byteFreqBuffer = new Uint8Array(binCount);
  const floatFreqBuffer = new Float32Array(binCount);
  const byteTimeBuffer = new Uint8Array(binCount);
  const floatTimeBuffer = new Float32Array(binCount);

  onCleanup(() => {
    source.disconnect(analyser);
  });

  return {
    analyser,
    getByteFrequencyData: () => {
      analyser.getByteFrequencyData(byteFreqBuffer);
      return byteFreqBuffer;
    },
    getFloatFrequencyData: () => {
      analyser.getFloatFrequencyData(floatFreqBuffer);
      return floatFreqBuffer;
    },
    getByteTimeDomainData: () => {
      analyser.getByteTimeDomainData(byteTimeBuffer);
      return byteTimeBuffer;
    },
    getFloatTimeDomainData: () => {
      analyser.getFloatTimeDomainData(floatTimeBuffer);
      return floatTimeBuffer;
    },
  };
}
