import "./setup";
import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { makeVideo, makeVideoPlayer, createVideo, createVideoPlayer } from "../src/index.js";

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

  it("can be called outside a Solid owner", () => {
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

  it("applies VideoOptions to the player", () => {
    const [player, cleanup] = makeVideo(testUrl, {}, { muted: true, loop: true });
    expect(player.muted).toBe(true);
    expect(player.loop).toBe(true);
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

  it("setPlaybackRate changes rate", () => {
    const [{ player, setPlaybackRate }, cleanup] = makeVideoPlayer(testUrl);
    setPlaybackRate(1.5);
    expect(player.playbackRate).toBe(1.5);
    cleanup();
  });

  it("setLoop changes loop", () => {
    const [{ player, setLoop }, cleanup] = makeVideoPlayer(testUrl);
    setLoop(true);
    expect(player.loop).toBe(true);
    cleanup();
  });
});

// ── createVideo ───────────────────────────────────────────────────────────────

describe("createVideo", () => {
  it("returns the expected shape", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl);
      expect(typeof video.playing).toBe("function");
      expect(typeof video.setPlaying).toBe("function");
      expect(typeof video.currentTime).toBe("function");
      expect(typeof video.seek).toBe("function");
      expect(typeof video.ended).toBe("function");
      expect(typeof video.seeking).toBe("function");
      expect(typeof video.error).toBe("function");
      expect(typeof video.duration).toBe("function");
      expect(video.player).toBeInstanceOf(HTMLVideoElement);
      dispose();
    }));

  it("initial playing is false", () =>
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

  it("seeking is false initially, true during seek, false after seeked", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl);
      expect(video.seeking()).toBe(false);
      video.player.dispatchEvent(new Event("seeking"));
      flush();
      expect(video.seeking()).toBe(true);
      video.player.dispatchEvent(new Event("seeked"));
      flush();
      expect(video.seeking()).toBe(false);
      dispose();
    }));

  it("error is null initially, set on error event, cleared on loadstart", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl);
      expect(video.error()).toBeNull();
      const mediaError = { code: 2, message: "MEDIA_ERR_NETWORK" } as MediaError;
      video.player._mock.error = mediaError;
      video.player.dispatchEvent(new Event("error"));
      flush();
      expect(video.error()).toBe(mediaError);
      video.player.dispatchEvent(new Event("loadstart"));
      flush();
      expect(video.error()).toBeNull();
      dispose();
    }));

  it("duration throws before load, returns number after", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl);
      expect(() => video.duration()).toThrow();
      video.player._mock._load(video.player);
      flush();
      expect(typeof video.duration()).toBe("number");
      dispose();
    }));

  it("applies options to the player element", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl, { muted: true, loop: true });
      expect(video.player.muted).toBe(true);
      expect(video.player.loop).toBe(true);
      dispose();
    }));

  it("src accessor change updates player source", () =>
    createRoot(async dispose => {
      const [src, setSrc] = createSignal("track1.mp4", { ownedWrite: true });
      const video = createVideo(src);
      expect(video.player.src).toMatch(/track1\.mp4$/);
      setSrc("track2.mp4");
      await tick();
      flush();
      expect(video.player.src).toMatch(/track2\.mp4$/);
      dispose();
    }));

  it("dispose pauses the player", () =>
    createRoot(dispose => {
      const video = createVideo(testUrl);
      dispose();
      expect(video.player._mock.paused).toBe(true);
    }));
});

// ── createVideoPlayer ───────────────────────────────────────────────────────

describe("createVideoPlayer", () => {
  it("includes all VideoReturn fields plus controls fields", () =>
    createRoot(dispose => {
      const video = createVideoPlayer(testUrl);
      // base fields
      expect(typeof video.playing).toBe("function");
      expect(typeof video.setPlaying).toBe("function");
      expect(typeof video.currentTime).toBe("function");
      expect(typeof video.seek).toBe("function");
      expect(typeof video.ended).toBe("function");
      expect(typeof video.seeking).toBe("function");
      expect(typeof video.error).toBe("function");
      expect(typeof video.duration).toBe("function");
      // controls fields
      expect(typeof video.volume).toBe("function");
      expect(typeof video.setVolume).toBe("function");
      expect(typeof video.muted).toBe("function");
      expect(typeof video.setMuted).toBe("function");
      expect(typeof video.playbackRate).toBe("function");
      expect(typeof video.setPlaybackRate).toBe("function");
      expect(typeof video.loop).toBe("function");
      expect(typeof video.setLoop).toBe("function");
      expect(typeof video.buffered).toBe("function");
      expect(typeof video.readyState).toBe("function");
      expect(typeof video.videoWidth).toBe("function");
      expect(typeof video.videoHeight).toBe("function");
      expect(video.player).toBeInstanceOf(HTMLVideoElement);
      dispose();
    }));

  it("initial volume is 1", () =>
    createRoot(dispose => {
      const video = createVideoPlayer(testUrl);
      expect(video.volume()).toBe(1);
      dispose();
    }));

  it("setVolume updates signal via volumechange event", () =>
    createRoot(async dispose => {
      const video = createVideoPlayer(testUrl);
      video.setVolume(0.4);
      flush();
      await tick();
      expect(video.volume()).toBe(0.4);
      dispose();
    }));

  it("initial muted is false", () =>
    createRoot(dispose => {
      const video = createVideoPlayer(testUrl);
      expect(video.muted()).toBe(false);
      dispose();
    }));

  it("setMuted updates signal via volumechange event", () =>
    createRoot(async dispose => {
      const video = createVideoPlayer(testUrl);
      video.setMuted(true);
      flush();
      await tick();
      expect(video.muted()).toBe(true);
      dispose();
    }));

  it("initial playbackRate is 1", () =>
    createRoot(dispose => {
      const video = createVideoPlayer(testUrl);
      expect(video.playbackRate()).toBe(1);
      dispose();
    }));

  it("setPlaybackRate updates signal via ratechange event", () =>
    createRoot(async dispose => {
      const video = createVideoPlayer(testUrl);
      video.setPlaybackRate(2);
      flush();
      await tick();
      expect(video.playbackRate()).toBe(2);
      dispose();
    }));

  it("initial loop is false", () =>
    createRoot(dispose => {
      const video = createVideoPlayer(testUrl);
      expect(video.loop()).toBe(false);
      dispose();
    }));

  it("setLoop updates both player.loop and signal (no DOM event)", () =>
    createRoot(dispose => {
      const video = createVideoPlayer(testUrl);
      video.setLoop(true);
      expect(video.player.loop).toBe(true);  // DOM update is synchronous
      flush();
      expect(video.loop()).toBe(true);        // signal update needs flush
      dispose();
    }));

  it("readyState updates when video loads", () =>
    createRoot(dispose => {
      const video = createVideoPlayer(testUrl);
      expect(video.readyState()).toBe(0);
      video.player._mock._load(video.player);
      flush();
      expect(video.readyState()).toBe(4);
      dispose();
    }));

  it("videoWidth and videoHeight update after metadata loads", () =>
    createRoot(dispose => {
      const video = createVideoPlayer(testUrl);
      expect(video.videoWidth()).toBe(0);
      expect(video.videoHeight()).toBe(0);
      video.player._mock._load(video.player);
      flush();
      expect(video.videoWidth()).toBe(1280);
      expect(video.videoHeight()).toBe(720);
      dispose();
    }));

  it("buffered is undefined initially, defined after progress event", () =>
    createRoot(dispose => {
      const video = createVideoPlayer(testUrl);
      expect(video.buffered()).toBeUndefined();
      video.player.dispatchEvent(new Event("progress"));
      flush();
      expect(video.buffered()).toBeDefined();
      dispose();
    }));

  it("VideoControlsOptions sets initial volume and playbackRate", () =>
    createRoot(dispose => {
      const video = createVideoPlayer(testUrl, { volume: 0.3, playbackRate: 1.5 });
      expect(video.volume()).toBe(0.3);
      expect(video.playbackRate()).toBe(1.5);
      dispose();
    }));

  it("VideoControlsOptions sets initial muted and loop via VideoOptions", () =>
    createRoot(dispose => {
      const video = createVideoPlayer(testUrl, { muted: true, loop: true });
      expect(video.muted()).toBe(true);
      expect(video.loop()).toBe(true);
      dispose();
    }));

  it("inherits seeking state from createVideo", () =>
    createRoot(dispose => {
      const video = createVideoPlayer(testUrl);
      expect(video.seeking()).toBe(false);
      video.player.dispatchEvent(new Event("seeking"));
      flush();
      expect(video.seeking()).toBe(true);
      dispose();
    }));

  it("inherits error state from createVideo", () =>
    createRoot(dispose => {
      const video = createVideoPlayer(testUrl);
      expect(video.error()).toBeNull();
      const mediaError = { code: 2, message: "MEDIA_ERR_NETWORK" } as MediaError;
      video.player._mock.error = mediaError;
      video.player.dispatchEvent(new Event("error"));
      flush();
      expect(video.error()).toBe(mediaError);
      dispose();
    }));

  it("dispose pauses the player", () =>
    createRoot(dispose => {
      const video = createVideoPlayer(testUrl);
      dispose();
      expect(video.player._mock.paused).toBe(true);
    }));
});
