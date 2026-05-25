import type { Accessor } from "solid-js";

export type VideoSource = string | undefined | MediaProvider;

export type VideoEventHandlers = {
  [K in keyof HTMLVideoElementEventMap]?: (event: HTMLVideoElementEventMap[K]) => void;
};

/** Initial configuration applied to the video element on creation. */
export type VideoOptions = {
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: "" | "none" | "metadata" | "auto";
};

/** Extends `VideoOptions` with initial values for controls-level properties. */
export type VideoControlsOptions = VideoOptions & {
  /** Initial volume (0–1). Defaults to the browser default (1). */
  volume?: number;
  /** Initial playback rate. Defaults to the browser default (1). */
  playbackRate?: number;
};

export type VideoControls = {
  play: () => Promise<void>;
  pause: VoidFunction;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setLoop: (loop: boolean) => void;
  player: HTMLVideoElement;
};

/** Return type of `createVideo` — essential playback state. */
export type VideoReturn = {
  player: HTMLVideoElement;
  /** `true` while the video is actively playing. */
  playing: Accessor<boolean>;
  setPlaying: (v: boolean) => void;
  currentTime: Accessor<number>;
  seek: (time: number) => void;
  /** `true` once playback has reached the end of the media. */
  ended: Accessor<boolean>;
  /** `true` while the player is seeking to a new position. */
  seeking: Accessor<boolean>;
  /** `MediaError` if the element has encountered a media error, otherwise `null`. */
  error: Accessor<MediaError | null>;
  /**
   * Throws `NotReadyError` until metadata has loaded (integrates with
   * `<Loading>`). After `loadedmetadata` fires, returns the duration in
   * seconds reactively. Resets to pending whenever the source changes.
   */
  duration: Accessor<number>;
};

/** Return type of `createVideoPlayer` — extends `VideoReturn` with full media controls. */
export type VideoControlsReturn = VideoReturn & {
  volume: Accessor<number>;
  setVolume: (v: number) => void;
  muted: Accessor<boolean>;
  setMuted: (v: boolean) => void;
  playbackRate: Accessor<number>;
  setPlaybackRate: (rate: number) => void;
  loop: Accessor<boolean>;
  setLoop: (v: boolean) => void;
  /** The current `TimeRanges` of buffered media, or `undefined` before first progress. */
  buffered: Accessor<TimeRanges | undefined>;
  /** `HTMLMediaElement.readyState` — 0 (HAVE_NOTHING) through 4 (HAVE_ENOUGH_DATA). */
  readyState: Accessor<number>;
  videoWidth: Accessor<number>;
  videoHeight: Accessor<number>;
};
