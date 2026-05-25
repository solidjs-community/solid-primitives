import { isServer } from "@solidjs/web";
import { noop } from "@solid-primitives/utils";
import type { VideoControls, VideoEventHandlers, VideoOptions, VideoSource } from "./types.js";

export function setVideoSrc(el: HTMLVideoElement, src: VideoSource): void {
  if (typeof src === "string") {
    el.src = src;
  } else {
    el.srcObject = (src as MediaProvider | null) ?? null;
  }
}

function unwrapSource(src: VideoSource | HTMLVideoElement): HTMLVideoElement {
  if (src instanceof HTMLVideoElement) return src;
  const player = document.createElement("video");
  setVideoSrc(player, src);
  return player;
}

function applyOptions(player: HTMLVideoElement, options: VideoOptions): void {
  if (options.autoPlay !== undefined) player.autoplay = options.autoPlay;
  if (options.loop !== undefined) player.loop = options.loop;
  if (options.muted !== undefined) player.muted = options.muted;
  if (options.preload !== undefined) player.preload = options.preload;
}

/**
 * Creates a raw `HTMLVideoElement` with optional event handlers and initial options.
 * Non-reactive — no Solid owner required. Returns a cleanup function.
 *
 * @param src Video URL, MediaProvider, or existing HTMLVideoElement
 * @param handlers Event handlers to bind against the player
 * @param options Initial element configuration (autoPlay, loop, muted, preload)
 * @returns Tuple of `[player, cleanup]`
 *
 * @example
 * ```ts
 * const [player, cleanup] = makeVideo('clip.mp4', {}, { muted: true });
 * ```
 */
export const makeVideo = (
  src: VideoSource | HTMLVideoElement,
  handlers: VideoEventHandlers = {},
  options?: VideoOptions,
): [player: HTMLVideoElement, cleanup: VoidFunction] => {
  if (isServer) return [{} as HTMLVideoElement, noop];

  const player = unwrapSource(src);
  if (options) applyOptions(player, options);

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
 * Wraps `makeVideo` with playback controls and exposes `player` for external
 * fullscreen handling. Fullscreen must be implemented by the consumer (e.g. via
 * `@solid-primitives/fullscreen`). Non-reactive — no Solid owner required.
 * Returns a cleanup function.
 *
 * @param src Video URL, MediaProvider, or existing HTMLVideoElement
 * @param handlers Event handlers to bind against the player
 * @param options Initial element configuration
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
  options?: VideoOptions,
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
        setLoop: noop,
        player: {} as HTMLVideoElement,
      },
      noop,
    ];
  }

  const [player, cleanup] = makeVideo(src, handlers, options);

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
    setLoop: (loop: boolean) => {
      player.loop = loop;
    },
  };

  return [controls, cleanup];
};
