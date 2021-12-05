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
    state: () => AudioState.LOADING,
    setState: (_state: AudioState) => {
      /*noop*/
    }
  };
};

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
    state: () => AudioState.LOADING,
    player: {} as HTMLAudioElement
  };
};

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
    state: () => AudioState.LOADING,
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
