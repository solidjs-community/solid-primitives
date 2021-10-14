import {
  createSignal,
  batch,
  onMount,
  onCleanup,
  createEffect
} from "solid-js";

// Set of control enums
export enum AudioState {
  LOADING = "loading",
  PLAYING = "playing",
  PAUSED = "paused",
  COMPLETE = "complete",
  STOPPED = "stopped",
  READY = "ready"
}

type AudioSource = string | MediaSource | string & MediaSource | (() => string | MediaSource | string & MediaSource)

/**
 * Creates an extremely basic audio generator method.
 *
 * @param src Path or object of the audio file that to be played
 * @param handlers An array of handlers to bind against the player
 * @return
 */
export const createAudioPlayer = (
  src: AudioSource,
  handlers: Array<[string, EventListener]>,
): {
  player: HTMLAudioElement;
  state: () => AudioState;
  setState: (state: AudioState) => void;
} => {
  const [state, setState] = createSignal<AudioState>(AudioState.STOPPED);
  const player: HTMLAudioElement = new Audio();
  const srcKey = typeof src === 'object' ? 'srcObject' : 'src';
  if (src instanceof Function) {
    player[srcKey] = src() as string & MediaSource;
    createEffect(() => (player[srcKey] = src() as string & MediaSource));
  } else {
    player[srcKey] = src as string & MediaSource;
  }
  // Handle management on create and clean-up
  onMount(() => 
    handlers.forEach(([evt, handler]) => player.addEventListener(evt, handler))
  );
  onCleanup(() =>
    handlers.forEach(([evt, handler]) =>
      player.removeEventListener(evt, handler)
    )
  );
  return { player, state, setState };
};

/**
 * Creates a simple audio manager with basic pause and play.
 *
 * @param path URL to the audio file that is to be played
 * @return options - @type Object
 * @return options.start - Start playing
 * @return options.stop - Stop playing
 * @return options.state - Current state of the player as a Symbol
 * @return Returns a location signal and one-off async query callback
 *
 * @example
 * ```ts
 * const [start, pause] = createAudio('./example1.mp3);
 * ```
 */
export const createAudio = (
  src: AudioSource,
): {
  play: () => void;
  pause: () => void;
  state: () => AudioState;
  player: HTMLAudioElement;
} => {
  const { player, state, setState } = createAudioPlayer(
    src,
    [
      ["loadeddata", () => setState(AudioState.READY)],
      ["loadstart", () => setState(AudioState.LOADING)],
      ["playing", () => setState(AudioState.PLAYING)],
      ["pause", () => setState(AudioState.PAUSED)]
    ]
  );
  // Audio controls
  const play = () => player.play();
  const pause = () => player.pause();
  return { play, pause, state, player };
};

/**
 * Creates a simple audio manager with most control actions.
 *
 * @param path URL to the audio file that is to be played
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
 * const [start, pause, seek, currentTime, duration] = createAudioManager('./example1.mp3);
 * ```
 */
export const createAudioManager = (
  src: AudioSource,
  volume: number = 1
): {
  play: () => void;
  pause: () => void;
  state: () => AudioState;
  currentTime: () => number;
  duration: () => number;
  setVolume: (volume: number) => void;
  seek: (position: number) => void;
  player: HTMLAudioElement;
} => {
  const [currentTime, setCurrentTime] = createSignal<number>(0);
  const [duration, setDuration] = createSignal<number>(0);
  // Bind recording events to the player
  const { player, state, setState } = createAudioPlayer(src, [
    [
      "loadeddata",
      () =>
        batch(() => {
          setState(AudioState.READY);
          setDuration(player.duration);
        })
    ],
    ["loadstart", () => setState(AudioState.LOADING)],
    ["playing", () => setState(AudioState.PLAYING)],
    ["pause", () => setState(AudioState.PAUSED)],
    ["loadstart", () => setState(AudioState.LOADING)],
    ["playing", () => setState(AudioState.PLAYING)],
    ["pause", () => setState(AudioState.PAUSED)],
    ["timeupdate", () => setCurrentTime(player.currentTime)]
  ]);
  // Audio controls
  const play = () => player.play();
  const pause = () => player.pause();
  const seek = (time: number) => player.fastSeek(time);
  const setVolume = (volume: number) => (player.volume = volume);

  createEffect(() => (player.volume = volume));

  return { play, pause, currentTime, state, duration, seek, setVolume, player };
};
