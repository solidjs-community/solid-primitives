import "regenerator-runtime/runtime";
import { AudioState } from '../src';

export class MockAudio extends Audio {
  src: string;
  state: AudioState;
  playing: boolean;
  constructor() {
    super();
    this.playing = false;
    this.state = AudioState.STOPPED;
    this.src = '';
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

window.Audio = MockAudio;
