import { makeAudio, makeAudioPlayer, createAudio } from "../src/index.js";
import { NotReadyError } from "solid-js";
import { describe, expect, it } from "vitest";

describe("API works in SSR", () => {
  it("makeAudio() - SSR returns stub player and noop cleanup", () => {
    const [player, cleanup] = makeAudio("https://example.com/audio.mp3");
    expect(player).toBeDefined();
    expect(cleanup).toBeInstanceOf(Function);
    expect(() => cleanup()).not.toThrow();
  });

  it("makeAudioPlayer() - SSR returns stub controls and noop cleanup", () => {
    const [controls, cleanup] = makeAudioPlayer("https://example.com/audio.mp3");
    expect(controls.play).toBeInstanceOf(Function);
    expect(controls.pause).toBeInstanceOf(Function);
    expect(controls.seek).toBeInstanceOf(Function);
    expect(controls.setVolume).toBeInstanceOf(Function);
    expect(() => cleanup()).not.toThrow();
  });

  it("createAudio() - SSR returns safe stubs with correct initial values", () => {
    const audio = createAudio("https://example.com/audio.mp3");
    expect(audio.playing()).toBe(false);
    expect(audio.volume()).toBe(1);
    expect(audio.currentTime()).toBe(0);
    expect(audio.setPlaying).toBeInstanceOf(Function);
    expect(audio.setVolume).toBeInstanceOf(Function);
    expect(audio.seek).toBeInstanceOf(Function);
  });

  it("createAudio() - SSR duration throws NotReadyError (integrates with <Loading>)", () => {
    const audio = createAudio("https://example.com/audio.mp3");
    expect(() => audio.duration()).toThrow(NotReadyError);
  });
});
