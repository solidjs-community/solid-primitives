import { noop } from "@solid-primitives/utils";
import * as API from "./index";

export const makeAudio: typeof API.makeAudio = () => ({} as HTMLAudioElement);

export const makeAudioPlayer: typeof API.makeAudioPlayer = () => ({
  pause: noop,
  play: noop,
  player: {} as HTMLAudioElement,
  seek: noop,
  setVolume: noop
});

export const createAudio: typeof API.createAudio = () => [
  {
    state: API.AudioState.LOADING,
    currentTime: 0,
    duration: 0,
    volume: 0,
    player: {} as HTMLAudioElement
  },
  {
    seek: noop,
    setVolume: noop,
    play: noop,
    pause: noop
  }
];
