import { type Accessor, createEffect, createSignal, NotReadyError, onCleanup } from "solid-js";
import { isServer } from "@solidjs/web";
import { access, INTERNAL_OPTIONS, noop } from "@solid-primitives/utils";
import { createEventListenerMap } from "@solid-primitives/event-listener";
import { makeVideo, setVideoSrc } from "./make.js";
import type { VideoOptions, VideoReturn, VideoSource } from "./types.js";

const NOT_SET: unique symbol = Symbol();

/**
 * A reactive video primitive with essential playback state.
 *
 * Returns `playing`, `currentTime`, `ended`, `seeking`, `error`, and a `duration`
 * that throws `NotReadyError` until metadata loads (integrates with `<Loading>`).
 *
 * For volume, muted, playback rate, fullscreen, and buffering state use
 * `createVideoControls`.
 *
 * @param src Video URL, MediaProvider, or a reactive accessor returning either
 * @param options Initial element configuration
 *
 * @example
 * ```ts
 * const video = createVideo('clip.mp4');
 * video.playing()         // boolean
 * video.setPlaying(true)  // plays
 * video.seek(30)
 * video.seeking()         // boolean — true while scrubbing
 * video.error()           // MediaError | null
 *
 * // duration() throws NotReadyError until metadata loads:
 * <Loading fallback={<p>Loading…</p>}>
 *   <p>{video.duration()}s</p>
 * </Loading>
 * ```
 */
export const createVideo = (
  src: VideoSource | Accessor<VideoSource>,
  options?: VideoOptions,
): VideoReturn => {
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
    };
  }

  const [player, cleanup] = makeVideo(access(src), {}, options);
  onCleanup(cleanup);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const seek = player.fastSeek
    ? (time: number) => player.fastSeek(time)
    : (time: number) => { player.currentTime = time; };

  const [playing, setPlayingSignal] = createSignal(!player.paused, INTERNAL_OPTIONS);
  const setPlaying = (v: boolean) => (v ? player.play() : player.pause());

  const [currentTime, setCurrentTime] = createSignal(0, INTERNAL_OPTIONS);
  const [ended, setEnded] = createSignal(false, INTERNAL_OPTIONS);
  const [seeking, setSeeking] = createSignal(false, INTERNAL_OPTIONS);
  const [error, setError] = createSignal<MediaError | null>(null, INTERNAL_OPTIONS);
  const [rawDuration, setRawDuration] = createSignal<number | typeof NOT_SET>(
    NOT_SET,
    INTERNAL_OPTIONS,
  );

  createEventListenerMap(player, {
    playing: () => setPlayingSignal(true),
    pause: () => setPlayingSignal(false),
    ended: () => {
      setPlayingSignal(false);
      setEnded(true);
    },
    play: () => setEnded(false),
    timeupdate: () => setCurrentTime(player.currentTime),
    seeking: () => setSeeking(true),
    seeked: () => setSeeking(false),
    error: () => setError(player.error),
    loadstart: () => {
      setRawDuration(NOT_SET);
      setError(null);
    },
    loadedmetadata: () => setRawDuration(player.duration),
  });

  const duration = (): number => {
    const val = rawDuration();
    if (val === NOT_SET) throw new NotReadyError("Video duration not yet available");
    return val;
  };

  if (src instanceof Function) {
    createEffect(src, (newSrc: VideoSource) => {
      setVideoSrc(player, newSrc);
      seek(0);
    });
  }

  return { player, playing, setPlaying, currentTime, seek, ended, seeking, error, duration };
};
