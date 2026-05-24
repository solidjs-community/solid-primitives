import { NotReadyError } from "solid-js";
import { describe, expect, it } from "vitest";
import { makeVideo, makeVideoPlayer, createVideo, createVideoPlayer } from "../src/index.js";

describe("API works in SSR", () => {
  it("makeVideo() returns stub player and noop cleanup", () => {
    const [player, cleanup] = makeVideo("https://example.com/clip.mp4");
    expect(player).toBeDefined();
    expect(cleanup).toBeInstanceOf(Function);
    expect(() => cleanup()).not.toThrow();
  });

  it("makeVideoPlayer() returns stub controls and noop cleanup", () => {
    const [controls, cleanup] = makeVideoPlayer("https://example.com/clip.mp4");
    expect(controls.play).toBeInstanceOf(Function);
    expect(controls.pause).toBeInstanceOf(Function);
    expect(controls.seek).toBeInstanceOf(Function);
    expect(controls.setVolume).toBeInstanceOf(Function);
    expect(controls.setMuted).toBeInstanceOf(Function);
    expect(controls.setPlaybackRate).toBeInstanceOf(Function);
    expect(controls.setLoop).toBeInstanceOf(Function);
    expect(() => cleanup()).not.toThrow();
  });

  it("createVideo() returns safe stubs with correct initial values", () => {
    const video = createVideo("https://example.com/clip.mp4");
    expect(video.playing()).toBe(false);
    expect(video.currentTime()).toBe(0);
    expect(video.ended()).toBe(false);
    expect(video.seeking()).toBe(false);
    expect(video.error()).toBeNull();
    expect(video.setPlaying).toBeInstanceOf(Function);
    expect(video.seek).toBeInstanceOf(Function);
  });

  it("createVideo() duration throws NotReadyError on server", () => {
    const video = createVideo("https://example.com/clip.mp4");
    expect(() => video.duration()).toThrow(NotReadyError);
  });

  it("createVideoPlayer() returns safe stubs with correct initial values", () => {
    const video = createVideoPlayer("https://example.com/clip.mp4");
    expect(video.playing()).toBe(false);
    expect(video.currentTime()).toBe(0);
    expect(video.ended()).toBe(false);
    expect(video.seeking()).toBe(false);
    expect(video.error()).toBeNull();
    expect(video.volume()).toBe(1);
    expect(video.muted()).toBe(false);
    expect(video.playbackRate()).toBe(1);
    expect(video.loop()).toBe(false);
    expect(video.buffered()).toBeUndefined();
    expect(video.readyState()).toBe(0);
    expect(video.videoWidth()).toBe(0);
    expect(video.videoHeight()).toBe(0);
    expect(video.setPlaying).toBeInstanceOf(Function);
    expect(video.setVolume).toBeInstanceOf(Function);
    expect(video.setMuted).toBeInstanceOf(Function);
    expect(video.setPlaybackRate).toBeInstanceOf(Function);
    expect(video.setLoop).toBeInstanceOf(Function);
  });

  it("createVideoPlayer() duration throws NotReadyError on server", () => {
    const video = createVideoPlayer("https://example.com/clip.mp4");
    expect(() => video.duration()).toThrow(NotReadyError);
  });
});
