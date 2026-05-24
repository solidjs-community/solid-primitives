import { NotReadyError } from "solid-js";
import { describe, expect, it } from "vitest";
import { makeVideo, makeVideoPlayer, createVideo } from "../src/index.js";

describe("API works in SSR", () => {
  it("makeVideo() - SSR returns stub player and noop cleanup", () => {
    const [player, cleanup] = makeVideo("https://example.com/clip.mp4");
    expect(player).toBeDefined();
    expect(cleanup).toBeInstanceOf(Function);
    expect(() => cleanup()).not.toThrow();
  });

  it("makeVideoPlayer() - SSR returns stub controls and noop cleanup", () => {
    const [controls, cleanup] = makeVideoPlayer("https://example.com/clip.mp4");
    expect(controls.play).toBeInstanceOf(Function);
    expect(controls.pause).toBeInstanceOf(Function);
    expect(controls.seek).toBeInstanceOf(Function);
    expect(controls.setVolume).toBeInstanceOf(Function);
    expect(controls.setMuted).toBeInstanceOf(Function);
    expect(controls.setPlaybackRate).toBeInstanceOf(Function);
    expect(controls.requestFullscreen).toBeInstanceOf(Function);
    expect(controls.exitFullscreen).toBeInstanceOf(Function);
    expect(controls.toggleFullscreen).toBeInstanceOf(Function);
    expect(() => cleanup()).not.toThrow();
  });

  it("createVideo() - SSR returns safe stubs with correct initial values", () => {
    const video = createVideo("https://example.com/clip.mp4");
    expect(video.playing()).toBe(false);
    expect(video.volume()).toBe(1);
    expect(video.muted()).toBe(false);
    expect(video.playbackRate()).toBe(1);
    expect(video.currentTime()).toBe(0);
    expect(video.ended()).toBe(false);
    expect(video.buffered()).toBeUndefined();
    expect(video.readyState()).toBe(0);
    expect(video.videoWidth()).toBe(0);
    expect(video.videoHeight()).toBe(0);
    expect(video.fullscreen()).toBe(false);
    expect(video.setPlaying).toBeInstanceOf(Function);
    expect(video.setVolume).toBeInstanceOf(Function);
    expect(video.setMuted).toBeInstanceOf(Function);
    expect(video.setPlaybackRate).toBeInstanceOf(Function);
    expect(video.seek).toBeInstanceOf(Function);
    expect(video.requestFullscreen).toBeInstanceOf(Function);
    expect(video.exitFullscreen).toBeInstanceOf(Function);
    expect(video.toggleFullscreen).toBeInstanceOf(Function);
  });

  it("createVideo() - SSR duration throws NotReadyError (integrates with <Loading>)", () => {
    const video = createVideo("https://example.com/clip.mp4");
    expect(() => video.duration()).toThrow(NotReadyError);
  });
});
