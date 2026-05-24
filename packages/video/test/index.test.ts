import "./setup";
import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { makeVideo, makeVideoPlayer, createVideo } from "../src/index.js";

const testUrl = "https://example.com/clip.mp4";

/** Yield to the microtask queue — used alongside flush() to drain Solid 2.0 effects. */
const tick = () => Promise.resolve();

// ── makeVideo ─────────────────────────────────────────────────────────────────

describe("makeVideo", () => {
  it("returns a player and cleanup tuple", () => {
    const [player, cleanup] = makeVideo(testUrl);
    expect(player.src).toBe(testUrl);
    expect(player._mock.paused).toBe(true);
    cleanup();
  });

  it("cleanup pauses the player and removes listeners", () => {
    let fired = false;
    const [player, cleanup] = makeVideo(testUrl, { play: () => (fired = true) });
    cleanup();
    player.dispatchEvent(new Event("play"));
    expect(fired).toBe(false);
  });

  it("can be called outside a Solid owner (no lifecycle dependency)", () => {
    expect(() => {
      const [, cleanup] = makeVideo(testUrl);
      cleanup();
    }).not.toThrow();
  });

  it("accepts MediaProvider as source", () => {
    const [player, cleanup] = makeVideo({} as MediaProvider);
    expect(typeof player.srcObject).toBe("object");
    cleanup();
  });

  it("accepts an existing HTMLVideoElement", () => {
    const el = document.createElement("video");
    el.src = testUrl;
    const [player, cleanup] = makeVideo(el);
    expect(player).toBe(el);
    cleanup();
  });
});

// ── makeVideoPlayer ───────────────────────────────────────────────────────────

describe("makeVideoPlayer", () => {
  it("returns controls and cleanup tuple", () => {
    const [controls, cleanup] = makeVideoPlayer(testUrl);
    expect(controls.player.src).toBe(testUrl);
    cleanup();
  });

  it("play and pause work", async () => {
    const [{ player, play, pause }, cleanup] = makeVideoPlayer(testUrl);
    expect(player._mock.paused).toBe(true);
    await play();
    expect(player._mock.paused).toBe(false);
    pause();
    expect(player.paused).toBe(true);
    cleanup();
  });

  it("seek updates currentTime", () => {
    const [{ player, seek }, cleanup] = makeVideoPlayer(testUrl);
    seek(42);
    expect(player.currentTime).toBe(42);
    cleanup();
  });

  it("setVolume updates volume", () => {
    const [{ player, setVolume }, cleanup] = makeVideoPlayer(testUrl);
    setVolume(0.5);
    expect(player.volume).toBe(0.5);
    cleanup();
  });

  it("setMuted toggles muted", () => {
    const [{ player, setMuted }, cleanup] = makeVideoPlayer(testUrl);
    setMuted(true);
    expect(player.muted).toBe(true);
    setMuted(false);
    expect(player.muted).toBe(false);
    cleanup();
  });

  it("setPlaybackRate changes playback rate", () => {
    const [{ player, setPlaybackRate }, cleanup] = makeVideoPlayer(testUrl);
    setPlaybackRate(1.5);
    expect(player.playbackRate).toBe(1.5);
    cleanup();
  });

  it("requestFullscreen enters fullscreen", async () => {
    const [{ player, requestFullscreen }, cleanup] = makeVideoPlayer(testUrl);
    await requestFullscreen();
    expect(document.fullscreenElement).toBe(player);
    await document.exitFullscreen();
    cleanup();
  });

  it("exitFullscreen leaves fullscreen", async () => {
    const [{ player, requestFullscreen, exitFullscreen }, cleanup] = makeVideoPlayer(testUrl);
    await requestFullscreen();
    expect(document.fullscreenElement).toBe(player);
    await exitFullscreen();
    expect(document.fullscreenElement).toBeNull();
    cleanup();
  });

  it("toggleFullscreen enters then exits fullscreen", async () => {
    const [{ player, toggleFullscreen }, cleanup] = makeVideoPlayer(testUrl);
    await toggleFullscreen();
    expect(document.fullscreenElement).toBe(player);
    await toggleFullscreen();
    expect(document.fullscreenElement).toBeNull();
    cleanup();
  });
});

// ── createVideo ───────────────────────────────────────────────────────────────

describe("createVideo", () => {
  it("returns an object with the expected shape", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl);
      expect(typeof video.playing).toBe("function");
      expect(typeof video.setPlaying).toBe("function");
      expect(typeof video.volume).toBe("function");
      expect(typeof video.setVolume).toBe("function");
      expect(typeof video.muted).toBe("function");
      expect(typeof video.setMuted).toBe("function");
      expect(typeof video.playbackRate).toBe("function");
      expect(typeof video.setPlaybackRate).toBe("function");
      expect(typeof video.currentTime).toBe("function");
      expect(typeof video.seek).toBe("function");
      expect(typeof video.ended).toBe("function");
      expect(typeof video.buffered).toBe("function");
      expect(typeof video.readyState).toBe("function");
      expect(typeof video.videoWidth).toBe("function");
      expect(typeof video.videoHeight).toBe("function");
      expect(typeof video.fullscreen).toBe("function");
      expect(typeof video.requestFullscreen).toBe("function");
      expect(typeof video.exitFullscreen).toBe("function");
      expect(typeof video.toggleFullscreen).toBe("function");
      expect(typeof video.duration).toBe("function");
      expect(video.player).toBeInstanceOf(HTMLVideoElement);
      dispose();
    }));

  it("initial playing state is false", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl);
      expect(video.playing()).toBe(false);
      dispose();
    }));

  it("setPlaying(true) plays the video", () =>
    createRoot(async dispose => {
      const video = createVideo(testUrl);
      video.setPlaying(true);
      await tick();
      flush();
      expect(video.player._mock.paused).toBe(false);
      expect(video.playing()).toBe(true);
      dispose();
    }));

  it("setPlaying(false) pauses the video", () =>
    createRoot(async dispose => {
      const video = createVideo(testUrl);
      video.setPlaying(true);
      await tick();
      video.setPlaying(false);
      await tick();
      expect(video.player.paused).toBe(true);
      expect(video.playing()).toBe(false);
      dispose();
    }));

  it("initial volume is 1", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl);
      expect(video.volume()).toBe(1);
      dispose();
    }));

  it("setVolume updates volume signal via volumechange event", () =>
    createRoot(async dispose => {
      const video = createVideo(testUrl);
      video.setVolume(0.4);
      flush();
      await tick();
      expect(video.volume()).toBe(0.4);
      dispose();
    }));

  it("initial muted is false", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl);
      expect(video.muted()).toBe(false);
      dispose();
    }));

  it("setMuted(true) updates muted signal via volumechange event", () =>
    createRoot(async dispose => {
      const video = createVideo(testUrl);
      video.setMuted(true);
      flush();
      await tick();
      expect(video.muted()).toBe(true);
      dispose();
    }));

  it("initial playbackRate is 1", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl);
      expect(video.playbackRate()).toBe(1);
      dispose();
    }));

  it("setPlaybackRate updates signal via ratechange event", () =>
    createRoot(async dispose => {
      const video = createVideo(testUrl);
      video.setPlaybackRate(2);
      flush();
      await tick();
      expect(video.playbackRate()).toBe(2);
      dispose();
    }));

  it("ended is false initially and true after ended event", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl);
      expect(video.ended()).toBe(false);
      video.player.dispatchEvent(new Event("ended"));
      flush();
      expect(video.ended()).toBe(true);
      dispose();
    }));

  it("ended resets to false on play", () =>
    createRoot(async dispose => {
      const video = createVideo(testUrl);
      video.player.dispatchEvent(new Event("ended"));
      flush();
      expect(video.ended()).toBe(true);
      video.setPlaying(true);
      await tick();
      flush();
      expect(video.ended()).toBe(false);
      dispose();
    }));

  it("readyState updates when video loads", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl);
      expect(video.readyState()).toBe(0);
      video.player._mock._load(video.player);
      flush();
      expect(video.readyState()).toBe(4);
      dispose();
    }));

  it("videoWidth and videoHeight update after metadata loads", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl);
      expect(video.videoWidth()).toBe(0);
      expect(video.videoHeight()).toBe(0);
      video.player._mock._load(video.player);
      flush();
      expect(video.videoWidth()).toBe(1280);
      expect(video.videoHeight()).toBe(720);
      dispose();
    }));

  it("duration throws NotReadyError before load, returns number after", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl);
      expect(() => video.duration(), "should throw before loadeddata").toThrow();
      video.player._mock._load(video.player);
      flush();
      expect(typeof video.duration()).toBe("number");
      dispose();
    }));

  it("fullscreen signal reflects fullscreen state", () =>
    createRoot(async dispose => {
      const video = createVideo(testUrl);
      expect(video.fullscreen()).toBe(false);
      await video.requestFullscreen();
      flush();
      expect(video.fullscreen()).toBe(true);
      await video.exitFullscreen();
      flush();
      expect(video.fullscreen()).toBe(false);
      dispose();
    }));

  it("toggleFullscreen enters and exits fullscreen", () =>
    createRoot(async dispose => {
      const video = createVideo(testUrl);
      await video.toggleFullscreen();
      flush();
      expect(video.fullscreen()).toBe(true);
      await video.toggleFullscreen();
      flush();
      expect(video.fullscreen()).toBe(false);
      dispose();
    }));

  it("src signal change updates player source and seeks to 0", () =>
    createRoot(async dispose => {
      const [src, setSrc] = createSignal("track1.mp4", { ownedWrite: true });
      const video = createVideo(src);
      expect(video.player.src).toMatch(/track1\.mp4$/);
      setSrc("track2.mp4");
      await tick();
      flush();
      expect(video.player.src).toMatch(/track2\.mp4$/);
      expect(video.player.currentTime).toBe(0);
      dispose();
    }));

  it("buffered is undefined initially, populated after progress event", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl);
      expect(video.buffered()).toBeUndefined();
      video.player.dispatchEvent(new Event("progress"));
      flush();
      expect(video.buffered()).toBeDefined();
      dispose();
    }));

  it("cleanup via dispose pauses the player", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl);
      dispose();
      expect(video.player._mock.paused).toBe(true);
    }));
});
