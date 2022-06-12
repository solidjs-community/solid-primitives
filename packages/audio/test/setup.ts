import "regenerator-runtime/runtime";
import { AudioState } from "../src";

export class MockAudio extends Audio {
  src: string;
  state: AudioState;
  duration: number;
  currentTime: number;
  playing: boolean;
  volume: number;
  constructor(src) {
    super();
    this.playing = false;
    this.volume = 0;
    this.state = AudioState.STOPPED;
    this.src = src;
  }
  fastSeek = (time: number): Promise<void> => {
    this.currentTime = time;
    return Promise.resolve();
  };
  play = async (): Promise<void> => {
    console.log('DO PLAY');
    this.playing = true;
    this.state = AudioState.PLAYING;
    return;
  };
  pause = (): void => {
    this.playing = false;
    this.state = AudioState.PAUSED;
    return;
  };
}

global.Audio = MockAudio;
