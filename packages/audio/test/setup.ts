import "regenerator-runtime/runtime";
import { AudioState } from '../src';

export class MockAudio extends Audio {
  src: string;
  state: AudioState;
  duration: number;
  playing: boolean;
  constructor() {
    super();
    this.playing = false;
    this.duration = NaN;
    this.state = AudioState.STOPPED;
    this.src = '';
  }
  fastSeek = (time: number): Promise<void> => {
    this.currentTime = time;
    return Promise.resolve();
  }
  play = (): Promise<void> => {
    this.playing = true;
    this.state = AudioState.PLAYING;
    return super.play();
  }
  pause = (): void => {
    this.playing = false;
    this.state = AudioState.PAUSED;
    return super.pause();
  }
}

HTMLMediaElement.prototype.pause = () => Promise.resolve();
HTMLMediaElement.prototype.play = () => Promise.resolve();

window.Audio = MockAudio;
