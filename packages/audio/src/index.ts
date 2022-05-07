import { createSignal, Accessor, batch, onMount, onCleanup, createEffect } from "solid-js";

// Set of control enums
export enum AudioState {
  LOADING = "loading",
  PLAYING = "playing",
  PAUSED = "paused",
  COMPLETE = "complete",
  STOPPED = "stopped",
  READY = "ready"
}

type AudioSource =
  | string
  | MediaSource
  | (string & MediaSource)
  | (() => string | MediaSource | (string & MediaSource));

/**
 * Generates a basic audio instance with no to minimal functionality.
 *
 * @param src Audio file path or MediaSource to be played
 * @param handlers An array of handlers to bind against the player
 * @return
 */
export const makeAudio = (
  src: string | undefined,
  handlers: { [key: string]: EventListener } = {}
): HTMLAudioElement => {
  const player: HTMLAudioElement = new Audio(src);
  const listeners = (enabled: boolean) => {
    Object.entries(handlers).forEach(([evt, handler]) =>
      player[enabled ? "addEventListener" : "removeEventListener"](evt, handler)
    );
  };
  // Handle management on create and clean-up
  onMount(() => listeners(true));
  onCleanup(() => {
    player.pause();
    listeners(false)
  });
  return player;
};

/**
 * Generates a basic audio player with simple control mechanisms.
 *
 * @param src Audio file path or MediaSource to be played
 * @return options - @type Object
 * @return options.start - Start playing
 * @return options.stop - Stop playing
 * @return options.state - Current state of the player as a Symbol
 * @return Returns a location signal and one-off async query callback
 *
 * @example
 * ```ts
 * const [start, pause] = makeAudio('./example1.mp3);
 * ```
 */
export const makeAudioPlayer = (
  src: AudioSource,
  handlers: { [key: string]: EventListener } = {}
): {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  player: HTMLAudioElement;
} => {
  const player = makeAudio(undefined, handlers);
  player[typeof src === "string" ? "src" : "srcObject"] = src as string & MediaSource;
  // Audio controls
  const play = () => player.play();
  const pause = () => player.pause();
  const seek = (time: number) => player.fastSeek(time);
  const setVolume = (volume: number) => (player.volume = volume);
  return { play, pause, seek, setVolume, player };
};

/**
 * Creates a simple audio manager with most control actions.
 *
 * @param src Audio file path or MediaSource to be played
 * @param volume Volume setting for the audio file
 * @return options - @type Object
 * @return options.start - Start playing
 * @return options.stop - Stop playing
 * @return options.currentTime - Current time that the player is at
 * @return options.state - Current state of the player as a Symbol
 * @return options.duration - Duration of the audio clip
 * @return options.seek - A function to support seeking
 * @return options.setVolume - A function to change the volume setting
 * @return Returns a location signal and one-off async query callback
 *
 * @example
 * ```ts
 * const [start, pause, seek, currentTime, duration] = createAudio('./example1.mp3, playing);
 * ```
 */
export const createAudio = (
  src: AudioSource,
  playing: Accessor<boolean>,
  volume?: Accessor<number>
): {
  state: () => AudioState;
  currentTime: () => number;
  duration: () => number;
} => {
  const [state, setState] = createSignal<AudioState>(AudioState.STOPPED);
  const [currentTime, setCurrentTime] = createSignal<number>(0);
  const [duration, setDuration] = createSignal<number>(0);
  const { play, pause, setVolume, player } = makeAudioPlayer(src, {
    loadeddata: () =>
      batch(() => {
        setState(AudioState.READY);
        setDuration(player.duration);
      }),
    timeupdate: () => setCurrentTime(player.currentTime),
    loadstart: () => setState(AudioState.LOADING),
    playing: () => setState(AudioState.PLAYING),
    pause: () => setState(AudioState.PAUSED)
  });
  if (src instanceof Function) {
    const srcKey = typeof src() === "string" ? "src" : "srcObject";
    player[srcKey] = src() as string & MediaSource;
    createEffect(() => (player[srcKey] = src() as string & MediaSource));
  }
  createEffect(() => (playing() === true ? play() : pause()));
  if (typeof volume !== "undefined") {
    createEffect(() => setVolume(volume()));
  }
  return { currentTime, state, duration };
};
