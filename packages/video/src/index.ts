import { type Accessor, createEffect, createSignal, NotReadyError, onCleanup } from "solid-js";
import { isServer } from "@solidjs/web";
import { access, INTERNAL_OPTIONS, noop } from "@solid-primitives/utils";
import { createEventListenerMap } from "@solid-primitives/event-listener";

const NOT_SET: unique symbol = Symbol();

export type VideoSource = string | undefined | MediaProvider;

export type VideoEventHandlers = {
  [K in keyof HTMLMediaElementEventMap]?: (event: HTMLMediaElementEventMap[K]) => void;
};

export type VideoControls = {
  play: () => Promise<void>;
  pause: VoidFunction;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  requestFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  player: HTMLVideoElement;
};

export type VideoReturn = {
  player: HTMLVideoElement;
  /** `true` while the video is actively playing. */
  playing: Accessor<boolean>;
  setPlaying: (v: boolean) => void;
  currentTime: Accessor<number>;
  seek: (time: number) => void;
  volume: Accessor<number>;
  setVolume: (v: number) => void;
  muted: Accessor<boolean>;
  setMuted: (v: boolean) => void;
  playbackRate: Accessor<number>;
  setPlaybackRate: (rate: number) => void;
  /** `true` once playback has reached the end of the media. */
  ended: Accessor<boolean>;
  /** The current `TimeRanges` of buffered media, or `undefined` before first progress. */
  buffered: Accessor<TimeRanges | undefined>;
  /** `HTMLMediaElement.readyState` — 0 (HAVE_NOTHING) through 4 (HAVE_ENOUGH_DATA). */
  readyState: Accessor<number>;
  videoWidth: Accessor<number>;
  videoHeight: Accessor<number>;
  /** `true` when this player is the active fullscreen element. */
  fullscreen: Accessor<boolean>;
  requestFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  /**
   * Throws `NotReadyError` until video metadata has loaded (integrates with
   * `<Loading>`). After the first `loadeddata` event returns the duration in
   * seconds reactively. Resets to pending whenever the source changes.
   */
  duration: Accessor<number>;
};

function setVideoSrc(el: HTMLVideoElement, src: VideoSource): void {
  if (typeof src === "string") {
    el.src = src;
  } else {
    el.srcObject = (src as MediaProvider | null) ?? null;
  }
}

const unwrapSource = (src: VideoSource | HTMLVideoElement): HTMLVideoElement => {
  if (src instanceof HTMLVideoElement) return src;
  const player = document.createElement("video");
  setVideoSrc(player, src);
  return player;
};

/**
 * Creates a raw `HTMLVideoElement` with optional event handlers.
 * Non-reactive — no Solid owner required. Returns a cleanup function.
 *
 * @param src Video URL, MediaProvider, or existing HTMLVideoElement
 * @param handlers Event handlers to bind against the player
 * @returns Tuple of `[player, cleanup]`
 *
 * @example
 * ```ts
 * const [player, cleanup] = makeVideo('https://example.com/clip.mp4');
 * ```
 */
export const makeVideo = (
  src: VideoSource | HTMLVideoElement,
  handlers: VideoEventHandlers = {},
): [player: HTMLVideoElement, cleanup: VoidFunction] => {
  if (isServer) return [{} as HTMLVideoElement, noop];

  const player = unwrapSource(src);

  for (const [name, handler] of Object.entries(handlers)) {
    player.addEventListener(name, handler as EventListener);
  }

  const cleanup = () => {
    player.pause();
    for (const [name, handler] of Object.entries(handlers)) {
      player.removeEventListener(name, handler as EventListener);
    }
  };

  return [player, cleanup];
};

/**
 * Wraps `makeVideo` with playback and fullscreen controls.
 * Non-reactive — no Solid owner required. Returns a cleanup function.
 *
 * @param src Video URL, MediaProvider, or existing HTMLVideoElement
 * @param handlers Event handlers to bind against the player
 * @returns Tuple of `[controls, cleanup]`
 *
 * @example
 * ```ts
 * const [{ play, pause, seek }, cleanup] = makeVideoPlayer('clip.mp4');
 * ```
 */
export const makeVideoPlayer = (
  src: VideoSource | HTMLVideoElement,
  handlers: VideoEventHandlers = {},
): [controls: VideoControls, cleanup: VoidFunction] => {
  if (isServer) {
    return [
      {
        play: async () => noop(),
        pause: noop,
        seek: noop,
        setVolume: noop,
        setMuted: noop,
        setPlaybackRate: noop,
        requestFullscreen: () => Promise.resolve(),
        exitFullscreen: () => Promise.resolve(),
        toggleFullscreen: () => Promise.resolve(),
        player: {} as HTMLVideoElement,
      },
      noop,
    ];
  }

  const [player, cleanup] = makeVideo(src, handlers);

  const controls: VideoControls = {
    player,
    play: () => player.play(),
    pause: () => player.pause(),
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    seek: player.fastSeek
      ? (time: number) => player.fastSeek(time)
      : (time: number) => {
          player.currentTime = time;
        },
    setVolume: (volume: number) => {
      player.volume = volume;
    },
    setMuted: (muted: boolean) => {
      player.muted = muted;
    },
    setPlaybackRate: (rate: number) => {
      player.playbackRate = rate;
    },
    requestFullscreen: async () => {
      if (!document.fullscreenElement) await player.requestFullscreen();
    },
    exitFullscreen: async () => {
      if (document.fullscreenElement === player) await document.exitFullscreen();
    },
    toggleFullscreen: async () => {
      if (document.fullscreenElement === player) {
        await document.exitFullscreen();
      } else {
        await player.requestFullscreen();
      }
    },
  };

  return [controls, cleanup];
};

/**
 * A reactive video primitive.
 *
 * Returns a flat object with writable derived signals for `playing`, `volume`,
 * `muted`, and `playbackRate`; reactive `currentTime`, `ended`, `buffered`,
 * `readyState`, `videoWidth`, `videoHeight`, and `fullscreen`; and a `duration`
 * that throws `NotReadyError` until metadata loads — integrating with `<Loading>`.
 *
 * @param src Video URL, MediaProvider, or a reactive accessor returning either
 *
 * @example
 * ```ts
 * const video = createVideo('clip.mp4');
 * // or reactive source:
 * const video = createVideo(() => selectedUrl());
 *
 * video.playing()            // boolean
 * video.setPlaying(true)     // plays
 * video.volume()             // 0–1
 * video.setVolume(0.5)
 * video.muted()              // boolean
 * video.setMuted(true)
 * video.playbackRate()       // number
 * video.setPlaybackRate(1.5)
 * video.seek(30)
 * video.requestFullscreen()
 *
 * // duration() throws NotReadyError until metadata loads:
 * <Loading fallback={<p>Loading…</p>}>
 *   <p>{video.duration()}s</p>
 * </Loading>
 * ```
 */
export const createVideo = (src: VideoSource | Accessor<VideoSource>): VideoReturn => {
  if (isServer) {
    return {
      player: {} as HTMLVideoElement,
      playing: () => false,
      setPlaying: noop,
      currentTime: () => 0,
      seek: noop,
      volume: () => 1,
      setVolume: noop,
      muted: () => false,
      setMuted: noop,
      playbackRate: () => 1,
      setPlaybackRate: noop,
      ended: () => false,
      buffered: () => undefined,
      readyState: () => 0,
      videoWidth: () => 0,
      videoHeight: () => 0,
      fullscreen: () => false,
      requestFullscreen: () => Promise.resolve(),
      exitFullscreen: () => Promise.resolve(),
      toggleFullscreen: () => Promise.resolve(),
      duration: () => {
        throw new NotReadyError("Video duration not available on the server");
      },
    };
  }

  const player = unwrapSource(access(src));
  const [controls, cleanup] = makeVideoPlayer(player);
  onCleanup(cleanup);

  // playing — writable derived signal; DOM events keep it in sync
  const [playing, setPlayingSignal] = createSignal(!player.paused, INTERNAL_OPTIONS);
  const setPlaying = (v: boolean) => (v ? controls.play() : controls.pause());

  // volume — writable derived signal; volumechange event keeps it in sync
  const [volume, setVolumeSignal] = createSignal(player.volume, INTERNAL_OPTIONS);
  const setVolume = (v: number) => {
    player.volume = v;
  };

  // muted — writable derived signal; volumechange event keeps it in sync
  const [muted, setMutedSignal] = createSignal(player.muted, INTERNAL_OPTIONS);
  const setMuted = (v: boolean) => {
    player.muted = v;
  };

  // playbackRate — writable derived signal; ratechange event keeps it in sync
  const [playbackRate, setPlaybackRateSignal] = createSignal(player.playbackRate, INTERNAL_OPTIONS);
  const setPlaybackRate = (v: number) => {
    player.playbackRate = v;
  };

  const [currentTime, setCurrentTime] = createSignal(0, INTERNAL_OPTIONS);
  const [ended, setEnded] = createSignal(false, INTERNAL_OPTIONS);
  const [buffered, setBuffered] = createSignal<TimeRanges | undefined>(undefined, INTERNAL_OPTIONS);
  const [readyState, setReadyState] = createSignal(player.readyState, INTERNAL_OPTIONS);
  const [videoWidth, setVideoWidth] = createSignal(player.videoWidth, INTERNAL_OPTIONS);
  const [videoHeight, setVideoHeight] = createSignal(player.videoHeight, INTERNAL_OPTIONS);
  const [fullscreen, setFullscreen] = createSignal(false, INTERNAL_OPTIONS);

  // duration — NOT_SET until loadeddata fires; resets to NOT_SET on loadstart (new source)
  const [rawDuration, setRawDuration] = createSignal<number | typeof NOT_SET>(
    NOT_SET,
    INTERNAL_OPTIONS,
  );

  const syncReadyState = () => setReadyState(player.readyState);
  const syncVideoDimensions = () => {
    setVideoWidth(player.videoWidth);
    setVideoHeight(player.videoHeight);
  };

  createEventListenerMap(player, {
    playing: () => setPlayingSignal(true),
    pause: () => setPlayingSignal(false),
    ended: () => {
      setPlayingSignal(false);
      setEnded(true);
    },
    play: () => setEnded(false),
    timeupdate: () => setCurrentTime(player.currentTime),
    volumechange: () => {
      setVolumeSignal(player.volume);
      setMutedSignal(player.muted);
    },
    ratechange: () => setPlaybackRateSignal(player.playbackRate),
    progress: () => setBuffered(player.buffered),
    loadedmetadata: () => {
      syncReadyState();
      syncVideoDimensions();
    },
    loadeddata: () => {
      syncReadyState();
      setRawDuration(player.duration);
    },
    canplay: syncReadyState,
    canplaythrough: syncReadyState,
    emptied: syncReadyState,
    loadstart: () => setRawDuration(NOT_SET),
    resize: syncVideoDimensions,
  });

  createEventListenerMap(document, {
    fullscreenchange: () => setFullscreen(document.fullscreenElement === player),
  });
  const duration = (): number => {
    const val = rawDuration();
    if (val === NOT_SET) throw new NotReadyError("Video duration not yet available");
    return val;
  };

  // Reactive src — update player source when accessor changes
  if (src instanceof Function) {
    createEffect(src, (newSrc: VideoSource) => {
      setVideoSrc(player, newSrc);
      controls.seek(0);
    });
  }

  return {
    player,
    playing,
    setPlaying,
    currentTime,
    seek: controls.seek,
    volume,
    setVolume,
    muted,
    setMuted,
    playbackRate,
    setPlaybackRate,
    ended,
    buffered,
    readyState,
    videoWidth,
    videoHeight,
    fullscreen,
    requestFullscreen: controls.requestFullscreen,
    exitFullscreen: controls.exitFullscreen,
    toggleFullscreen: controls.toggleFullscreen,
    duration,
  };
};
