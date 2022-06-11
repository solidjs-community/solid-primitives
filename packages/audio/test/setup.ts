import "regenerator-runtime/runtime";
import { AudioState } from "../src";

export class MockAudio extends Audio {
  src: string;
  state: AudioState;
  duration: number;
  currentTime: number;
  playing: boolean;
  constructor(src) {
    super();
    this.playing = false;
    this.state = AudioState.STOPPED;
    this.src = src;
  }
  fastSeek = (time: number): Promise<void> => {
    this.currentTime = time;
    return Promise.resolve();
  };
  play = async (): Promise<void> => {
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
