import "./setup";
import { createRoot, createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { makeAudio, makeAudioPlayer, createAudio, AudioState } from "../src/index.js";

const testPath =
  "https://github.com/solidjs-community/solid-primitives/blob/audio/packages/audio/dev/sample1.mp3?raw=true";

/** Yield to the microtask queue twice — enough for Solid 2.0's split compute/apply effect model. */
const tick = () => Promise.resolve().then(() => Promise.resolve());

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
      setPlaying(true);
      await tick();
      expect(audio.player._mock.paused).toBe(false);
      expect(audio.player.volume).toBe(0.25);
      setVolume(0.5);
      await tick();
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

  it("initial volume is applied synchronously", () =>
    createRoot(dispose => {
      const [volume] = createSignal(0.5);
      const [audio] = createAudio("test.mp3", undefined, volume);
      expect(audio.player.volume).toBe(0.5);
      dispose();
    }));

  it("src signal change updates player source", () =>
    createRoot(async dispose => {
      const [src, setSrc] = createSignal("track1.mp3");
      const [audio] = createAudio(src);
      expect(audio.player.src).toBe("track1.mp3");
      setSrc("track2.mp3");
      await tick();
      expect(audio.player.src).toBe("track2.mp3");
      dispose();
    }));
});
