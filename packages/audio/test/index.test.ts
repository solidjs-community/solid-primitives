import "./setup";
import { createRoot, createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { makeAudio, makeAudioPlayer, createAudio, AudioState } from "../src/index.js";

const testPath =
  "https://github.com/solidjs-community/solid-primitives/blob/audio/packages/audio/dev/sample1.mp3?raw=true";

describe("makeAudio", () => {
  it("test static string path", () =>
    createRoot(dispose => {
      const player = makeAudio(testPath);
      expect(player._mock.paused).toBe(true);
      expect(player.src).toBe(testPath);
      dispose();
    }));
});

describe("makeAudioPlayer", () => {
  it("test play pause", () =>
    createRoot(async dispose => {
      const { player, play, pause } = makeAudioPlayer(testPath);
      expect(player.src).toBe(testPath);
      expect(player._mock.paused).toBe(true);
      await play();
      expect(player._mock.paused).toBe(false);
      await pause();
      expect(player.paused).toBe(true);
      dispose();
    }));

  it("test seek and volume", () =>
    createRoot(async dispose => {
      const { player, seek, setVolume } = makeAudioPlayer(testPath);
      seek(500);
      expect(player.currentTime).toBe(500);
      setVolume(0.75);
      expect(player.volume).toBe(0.75);
      dispose();
    }));

  it("test srcObject value path", () =>
    createRoot(dispose => {
      const { player } = makeAudioPlayer({} as MediaSource);
      expect(typeof player.srcObject).toBe("object");
      dispose();
    }));
});

describe("createAudio", () => {
  it("test srcObject value path", () =>
    createRoot(dispose => {
      const media = {} as MediaSource;
      let [audio] = createAudio(media);
      expect(typeof audio.player.srcObject).toBe("object");
      [audio] = createAudio(() => media);
      expect(typeof audio.player.srcObject).toBe("object");
      dispose();
    }));

  it("test basic reactive controls", () =>
    createRoot(async dispose => {
      const [playing, setPlaying] = createSignal(false);
      const [volume, setVolume] = createSignal(0.25);
      const [audio] = createAudio("test.mp3", playing, volume);
      audio.player._mock._load(audio.player);
      expect(audio.player._mock.paused).toBe(true);
      await setPlaying(true);
      expect(audio.player._mock.paused).toBe(false);
      expect(audio.player.volume).toBe(0.25);
      await setVolume(0.5);
      expect(audio.player.volume).toBe(0.5);
      dispose();
    }));

  it("should set the COMPLETE state when audio ends", () => {
    const [[audio], dispose] = createRoot(dispose => [createAudio({} as MediaSource), dispose]);
    expect(audio.state).toBe(AudioState.LOADING);

    audio.player.dispatchEvent(new Event("ended"));
    expect(audio.state).toBe(AudioState.COMPLETE);

    dispose();
  });
});
