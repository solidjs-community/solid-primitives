/**
 * Creates an extremely basic audio generator method.
 *
 * @param src Audio file path or MediaSource to be played
 * @param handlers An array of handlers to bind against the player
 * @return
 */
export const createAudioPlayer = (
  _src: AudioSource,
  _handlers: Array<[string, EventListener]>
): {
  player: HTMLAudioElement;
  state: () => AudioState;
  setState: (state: AudioState) => void;
} => {
  return {
    player: {} as HTMLAudioElement,
    state: () => ({} as AudioState),
    setState: (_state: AudioState) => {
      /*noop*/
    }
  };
};

/**
 * Creates a simple audio manager with basic pause and play.
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
 * const [start, pause] = createAudio('./example1.mp3);
 * ```
 */
export const createAudio = (
  _src: AudioSource
): {
  play: () => void;
  pause: () => void;
  state: () => AudioState;
  player: HTMLAudioElement;
} => {
  return {
    play: () => {
      /* noop */
    },
    pause: () => {
      /* noop */
    },
    state: () => ({} as AudioState),
    player: {} as HTMLAudioElement
  };
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
 * const [start, pause, seek, currentTime, duration] = createAudioManager('./example1.mp3);
 * ```
 */
export const createAudioManager = (
  _src: AudioSource,
  _volume: number = 1
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
  return {
    play: () => {
      /* noop */
    },
    pause: () => {
      /* noop */
    },
    currentTime: () => 0,
    state: () => ({} as AudioState),
    duration: () => 0,
    seek: () => {
      /* noop */
    },
    setVolume: () => {
      /* noop */
    },
    player: {} as HTMLAudioElement
  };
};
