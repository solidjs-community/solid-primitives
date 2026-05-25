import { createSignal, NotReadyError } from "solid-js";
import { isServer } from "@solidjs/web";
import { INTERNAL_OPTIONS, noop } from "@solid-primitives/utils";
import { createEventListenerMap } from "@solid-primitives/event-listener";
import { createVideo } from "./createVideo.js";
import type { VideoControlsOptions, VideoControlsReturn, VideoSource } from "./types.js";
import type { Accessor } from "solid-js";

/**
 * A reactive video primitive with full media controls.
 *
 * Extends `createVideo` with `volume`, `muted`, `playbackRate`, `loop`,
 * `buffered`, `readyState`, `videoWidth`, and `videoHeight`.
 *
 * @param src Video URL, MediaProvider, or a reactive accessor returning either
 * @param options Initial element configuration including volume and playback rate
 *
 * @example
 * ```ts
 * const video = createVideoPlayer('clip.mp4', { muted: true, volume: 0.8 });
 * video.playing()              // boolean
 * video.volume()               // 0–1
 * video.setVolume(0.5)
 * video.muted()                // boolean
 * video.setMuted(true)
 * video.playbackRate()         // number
 * video.setPlaybackRate(1.5)
 * video.loop()                 // boolean
 * video.setLoop(true)
 * video.buffered()             // TimeRanges | undefined
 * video.readyState()           // 0–4
 * video.videoWidth()           // number
 * video.videoHeight()          // number
 * ```
 */
export const createVideoPlayer = (
  src: VideoSource | Accessor<VideoSource>,
  options?: VideoControlsOptions,
): VideoControlsReturn => {
  if (isServer) {
    return {
      player: {} as HTMLVideoElement,
      playing: () => false,
      setPlaying: noop,
      currentTime: () => 0,
      seek: noop,
      ended: () => false,
      seeking: () => false,
      error: () => null,
      duration: () => {
        throw new NotReadyError("Video duration not available on the server");
      },
      volume: () => 1,
      setVolume: noop,
      muted: () => false,
      setMuted: noop,
      playbackRate: () => 1,
      setPlaybackRate: noop,
      loop: () => false,
      setLoop: noop,
      buffered: () => undefined,
      readyState: () => 0,
      videoWidth: () => 0,
      videoHeight: () => 0,
    };
  }

  const base = createVideo(src, options);
  const { player } = base;

  // Apply controls-level initial values before reading signal initial state.
  if (options?.volume !== undefined) player.volume = options.volume;
  if (options?.playbackRate !== undefined) player.playbackRate = options.playbackRate;

  const [volume, setVolumeSignal] = createSignal(player.volume, INTERNAL_OPTIONS);
  const setVolume = (v: number) => {
    player.volume = v;
  };

  const [muted, setMutedSignal] = createSignal(player.muted, INTERNAL_OPTIONS);
  const setMuted = (v: boolean) => {
    player.muted = v;
  };

  const [playbackRate, setPlaybackRateSignal] = createSignal(player.playbackRate, INTERNAL_OPTIONS);
  const setPlaybackRate = (v: number) => {
    player.playbackRate = v;
  };

  // loop has no DOM event — setLoop must update both DOM and signal directly.
  const [loop, setLoopSignal] = createSignal(player.loop, INTERNAL_OPTIONS);
  const setLoop = (v: boolean) => {
    player.loop = v;
    setLoopSignal(v);
  };

  const [buffered, setBuffered] = createSignal<TimeRanges | undefined>(undefined, INTERNAL_OPTIONS);
  const [readyState, setReadyState] = createSignal(player.readyState, INTERNAL_OPTIONS);
  const [videoWidth, setVideoWidth] = createSignal(player.videoWidth, INTERNAL_OPTIONS);
  const [videoHeight, setVideoHeight] = createSignal(player.videoHeight, INTERNAL_OPTIONS);

  const syncReadyState = () => setReadyState(player.readyState);
  const syncVideoDimensions = () => {
    setVideoWidth(player.videoWidth);
    setVideoHeight(player.videoHeight);
  };

  createEventListenerMap(player, {
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
    loadeddata: syncReadyState,
    canplay: syncReadyState,
    canplaythrough: syncReadyState,
    emptied: syncReadyState,
    resize: syncVideoDimensions,
  });

  return {
    ...base,
    volume,
    setVolume,
    muted,
    setMuted,
    playbackRate,
    setPlaybackRate,
    loop,
    setLoop,
    buffered,
    readyState,
    videoWidth,
    videoHeight,
  };
};
