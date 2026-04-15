import "./setup";
import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { makeAudio, makeAudioPlayer, createAudio } from "../src/index.js";

const testPath =
  "https://github.com/solidjs-community/solid-primitives/blob/audio/packages/audio/dev/sample1.mp3?raw=true";

/** Yield to the microtask queue — used alongside flush() to drain Solid 2.0 effects. */
const tick = () => Promise.resolve();

// ── makeAudio ─────────────────────────────────────────────────────────────────

describe("makeAudio", () => {
  it("returns a player and cleanup tuple", () => {
    const [player, cleanup] = makeAudio(testPath);
    expect(player.src).toBe(testPath);
    expect(player._mock.paused).toBe(true);
    cleanup();
  });

  it("cleanup pauses the player and removes listeners", () => {
    let fired = false;
    const [player, cleanup] = makeAudio(testPath, { play: () => (fired = true) });
    cleanup();
    player.dispatchEvent(new Event("play"));
    expect(fired).toBe(false); // listener was removed
  });

  it("can be called outside a Solid owner (no lifecycle dependency)", () => {
    expect(() => {
      const [, cleanup] = makeAudio(testPath);
      cleanup();
    }).not.toThrow();
  });

  it("accepts MediaProvider as source (issue #721)", () => {
    const [player, cleanup] = makeAudio({} as MediaProvider);
    expect(typeof player.srcObject).toBe("object");
    cleanup();
  });

  it("accepts MediaStream as source (issue #721)", () => {
    const stream = {} as MediaStream;
    const [player, cleanup] = makeAudio(stream);
    expect(player.srcObject).toBe(stream);
    cleanup();
  });
});

// ── makeAudioPlayer ───────────────────────────────────────────────────────────

describe("makeAudioPlayer", () => {
  it("returns controls and cleanup tuple", () => {
    const [controls, cleanup] = makeAudioPlayer(testPath);
    expect(controls.player.src).toBe(testPath);
    cleanup();
  });

  it("play and pause work", async () => {
    const [{ player, play, pause }, cleanup] = makeAudioPlayer(testPath);
    expect(player._mock.paused).toBe(true);
    await play();
    expect(player._mock.paused).toBe(false);
    pause();
    expect(player.paused).toBe(true);
    cleanup();
  });

  it("seek and setVolume work", () => {
    const [{ player, seek, setVolume }, cleanup] = makeAudioPlayer(testPath);
    seek(500);
    expect(player.currentTime).toBe(500);
    setVolume(0.75);
    cleanup();
  });

  it("accepts MediaProvider as source", () => {
    const [{ player }, cleanup] = makeAudioPlayer({} as MediaProvider);
    expect(typeof player.srcObject).toBe("object");
    cleanup();
  });
});

// ── createAudio ───────────────────────────────────────────────────────────────

describe("createAudio", () => {
  it("returns flat object with expected shape", () =>
    createRoot(dispose => {
      const audio = createAudio(testPath);
      expect(typeof audio.playing).toBe("function");
      expect(typeof audio.setPlaying).toBe("function");
      expect(typeof audio.volume).toBe("function");
      expect(typeof audio.setVolume).toBe("function");
      expect(typeof audio.currentTime).toBe("function");
      expect(typeof audio.duration).toBe("function");
      expect(typeof audio.seek).toBe("function");
      expect(audio.player).toBeInstanceOf(HTMLAudioElement);
      dispose();
    }));

  it("initial playing state is false", () =>
    createRoot(dispose => {
      const audio = createAudio(testPath);
      expect(audio.playing()).toBe(false);
      dispose();
    }));

  it("setPlaying(true) plays the audio", () =>
    createRoot(async dispose => {
      const audio = createAudio(testPath);
      audio.setPlaying(true);
      await tick();
      flush();
      expect(audio.player._mock.paused).toBe(false);
      expect(audio.playing()).toBe(true);
      dispose();
    }));

  it("setPlaying(false) pauses the audio", () =>
    createRoot(async dispose => {
      const audio = createAudio(testPath);
      audio.setPlaying(true);
      await tick();
      audio.setPlaying(false);
      await tick();
      expect(audio.player.paused).toBe(true);
      expect(audio.playing()).toBe(false);
      dispose();
    }));

  it("setVolume updates volume signal via volumechange event", () =>
    createRoot(async dispose => {
      const audio = createAudio(testPath);
      audio.setVolume(0.4);
      audio.player.dispatchEvent(new Event("volumechange"));
      flush();
      await tick();
      expect(audio.volume()).toBe(0.4);
      dispose();
    }));

  it("duration resolves after loadeddata fires", () =>
    createRoot(async dispose => {
      const audio = createAudio(testPath);
      audio.player._mock._load(audio.player);
      const dur = await audio.duration();
      expect(typeof dur).toBe("number");
      dispose();
    }));

  it("src signal change updates player source and seeks to 0", () =>
    createRoot(async dispose => {
      const [src, setSrc] = createSignal("track1.mp3");
      const audio = createAudio(src);
      expect(audio.player.src).toMatch(/track1\.mp3$/);
      setSrc("track2.mp3");
      await tick();
      flush();
      expect(audio.player.src).toMatch(/track2\.mp3$/);
      expect(audio.player.currentTime).toBe(0);
      dispose();
    }));

  it("accepts MediaProvider as source (issue #721)", () =>
    createRoot(dispose => {
      const audio = createAudio({} as MediaProvider);
      expect(typeof audio.player.srcObject).toBe("object");
      dispose();
    }));

  it("cleanup via dispose pauses the player", () =>
    createRoot(dispose => {
      const audio = createAudio(testPath);
      dispose();
      expect(audio.player._mock.paused).toBe(true);
    }));
});
