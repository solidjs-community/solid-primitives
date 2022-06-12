export const makeAudio = (
  _src: AudioSource,
  _handlers: Array<[string, EventListener]>
): HTMLAudioElement => ({} as HTMLAudioElement);

export const makeAudioPlayer = (
  _src: AudioSource
): HTMLAudioElement => {
  return {} as HTMLAudioElement;
};

export const createAudioManager = (
  _src: AudioSource,
  _volume: number = 1
): {
  seek: (time: number) => void,
  state: AudioState,
  currentTime: number,
  duration: number,
  player: HTMLAudioElement
} => {
  return {
    state: AudioState.LOADING,
    duration: 0,
    seek: (_time: number) => {
      /* noop */
    },
    currentTime: 0,
    player: {} as HTMLAudioElement
  };
};
