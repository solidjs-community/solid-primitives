import { createBaseAudio, createAudio, AudioState } from "../src/index";
import { MockAudio } from './setup';

describe("createBaseAudio", () => {
  test("test static string path", async () => {
    const { player } = createBaseAudio('test.mp3', []);
    const mocked = player as MockAudio;
    expect(mocked.playing).toBe(false);
    expect(mocked.state).toBe(AudioState.STOPPED);
    expect(mocked.src).toBe('test.mp3');
  });
  test("test reactive value path", async () => {
    const { player } = createBaseAudio(() => 'test.mp3', []);
    expect(player.src).toBe('test.mp3');
  });
});

describe("createAudio", () => {
  test("test static string path", async () => {
    const { play, pause, player } = createAudio('test.mp3');
    const mocked = player as MockAudio;
    expect(mocked.playing).toBe(false);
    expect(mocked.state).toBe(AudioState.STOPPED);
    await play();
    expect(mocked.playing).toBe(true);
    expect(mocked.state).toBe(AudioState.PLAYING);
    await pause();
    expect(mocked.playing).toBe(false);
    expect(mocked.state).toBe(AudioState.PAUSED);
  });
});
