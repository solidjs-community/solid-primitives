import { createBaseAudio, createAudio, AudioState } from "../src/index";

class MockAudio extends Audio {
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
    return super.play();
  }
  pause = (): void => {
    this.playing = false;
    return super.pause();
  }
}

describe("createBaseAudio", () => {
  test("test static string path", async () => {
    const { player } = createBaseAudio('test.mp3', [], MockAudio);
    const mocked = player as MockAudio;
    expect(mocked.playing).toBe(false);
    expect(mocked.state).toBe(AudioState.STOPPED);
    expect(mocked.src).toBe('test.mp3');
  });
  test("test reactive value path", async () => {
    const { player } = createBaseAudio(() => 'test.mp3', [], MockAudio);
    expect(player.src).toBe('test.mp3');
  });
});

describe("createAudio", () => {
  test("test static string path", async () => {
    const { play, pause, player } = createAudio('test.mp3', MockAudio);
    const mocked = player as MockAudio;
    expect(mocked.playing).toBe(false);
    expect(mocked.state).toBe(AudioState.STOPPED);
    play();
    expect(mocked.playing).toBe(true);
    expect(mocked.state).toBe(AudioState.PLAYING);
    pause();
    expect(mocked.playing).toBe(false);
    expect(mocked.state).toBe(AudioState.PAUSED);
  });
});
