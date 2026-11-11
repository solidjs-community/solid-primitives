import "./setup.js";
import { createRoot, createSignal, flush } from "solid-js";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { makeFaviconAnimation, createFaviconAnimation } from "../src/index.js";

const frames = ["/f1.png", "/f2.png", "/f3.png"];

beforeAll(() => {
  vi.useFakeTimers();
});

beforeEach(() => {
  vi.clearAllTimers();
});

afterEach(() => {
  document.head.querySelectorAll('link[rel="icon"]').forEach(el => el.remove());
});

afterAll(() => {
  vi.useRealTimers();
});

describe("makeFaviconAnimation", () => {
  test("autoplays and cycles frames on an interval", () => {
    const anim = makeFaviconAnimation(frames, { interval: 100 });
    expect(anim.frame).toBe(0);
    expect(anim.playing).toBe(true);

    vi.advanceTimersByTime(100);
    expect(anim.frame).toBe(1);

    vi.advanceTimersByTime(100);
    expect(anim.frame).toBe(2);

    // loops back to the start by default
    vi.advanceTimersByTime(100);
    expect(anim.frame).toBe(0);

    anim.dispose();
  });

  test("loop: false stops on the last frame", () => {
    const anim = makeFaviconAnimation(frames, { interval: 100, loop: false });

    vi.advanceTimersByTime(100);
    vi.advanceTimersByTime(100);
    expect(anim.frame).toBe(2);
    expect(anim.playing).toBe(true);

    vi.advanceTimersByTime(100);
    expect(anim.frame).toBe(2);
    expect(anim.playing).toBe(false);

    anim.dispose();
  });

  test("pause stops advancing, play resumes", () => {
    const anim = makeFaviconAnimation(frames, { interval: 100 });
    anim.pause();
    expect(anim.playing).toBe(false);

    vi.advanceTimersByTime(300);
    expect(anim.frame).toBe(0);

    anim.play();
    vi.advanceTimersByTime(100);
    expect(anim.frame).toBe(1);

    anim.dispose();
  });

  test("autoplay: false does not start the interval", () => {
    const anim = makeFaviconAnimation(frames, { interval: 100, autoplay: false });
    expect(anim.playing).toBe(false);
    vi.advanceTimersByTime(500);
    expect(anim.frame).toBe(0);
    anim.dispose();
  });

  test("dispose restores the previous favicon and stops the interval", () => {
    const anim = makeFaviconAnimation(frames, { interval: 100 });
    anim.dispose();
    expect(document.head.querySelector('link[rel="icon"]')).toBeNull();
    // shouldn't throw / advance a disposed timer
    vi.advanceTimersByTime(1000);
  });

  test("a single frame never starts an interval", () => {
    const anim = makeFaviconAnimation(["/only.png"], { interval: 100 });
    expect(anim.playing).toBe(false);
    anim.dispose();
  });
});

describe("createFaviconAnimation", () => {
  test("cycles frames reactively and restores on cleanup", () => {
    const { spinner, dispose } = createRoot(dispose => ({
      spinner: createFaviconAnimation(frames, { interval: 100 }),
      dispose,
    }));
    flush();
    expect(spinner.frame()).toBe(0);
    expect(spinner.playing()).toBe(true);

    vi.advanceTimersByTime(100);
    flush();
    expect(spinner.frame()).toBe(1);

    dispose();
    expect(document.head.querySelector('link[rel="icon"]')).toBeNull();
  });

  test("play/pause update the playing signal", () => {
    const { spinner, dispose } = createRoot(dispose => ({
      spinner: createFaviconAnimation(frames, { interval: 100 }),
      dispose,
    }));
    spinner.pause();
    flush();
    expect(spinner.playing()).toBe(false);

    vi.advanceTimersByTime(300);
    flush();
    expect(spinner.frame()).toBe(0);

    spinner.play();
    flush();
    expect(spinner.playing()).toBe(true);
    vi.advanceTimersByTime(100);
    flush();
    expect(spinner.frame()).toBe(1);

    dispose();
  });

  test("swapping the frames accessor restarts the cycle", () => {
    const [list, setList] = createSignal<readonly string[]>(frames);
    const { spinner, dispose } = createRoot(dispose => ({
      spinner: createFaviconAnimation(list, { interval: 100 }),
      dispose,
    }));

    vi.advanceTimersByTime(100);
    flush();
    expect(spinner.frame()).toBe(1);

    setList(["/x.png", "/y.png"]);
    flush();
    expect(spinner.frame()).toBe(0);

    dispose();
  });

  test("shrinking to one frame pauses; growing back past one resumes when autoplay is set", () => {
    const [list, setList] = createSignal<readonly string[]>(frames);
    const { spinner, dispose } = createRoot(dispose => ({
      spinner: createFaviconAnimation(list, { interval: 100 }),
      dispose,
    }));
    flush();
    expect(spinner.playing()).toBe(true);

    setList(["/solo.png"]);
    flush();
    expect(spinner.playing()).toBe(false);

    vi.advanceTimersByTime(300);
    flush();
    expect(spinner.frame()).toBe(0); // no interval running while at one frame

    setList(["/x.png", "/y.png"]);
    flush();
    expect(spinner.playing()).toBe(true);

    vi.advanceTimersByTime(100);
    flush();
    expect(spinner.frame()).toBe(1);

    dispose();
  });

  test("growing past one frame does not autoplay when autoplay is false", () => {
    const [list, setList] = createSignal<readonly string[]>(["/solo.png"]);
    const { spinner, dispose } = createRoot(dispose => ({
      spinner: createFaviconAnimation(list, { interval: 100, autoplay: false }),
      dispose,
    }));
    flush();
    expect(spinner.playing()).toBe(false);

    setList(["/x.png", "/y.png"]);
    flush();
    expect(spinner.playing()).toBe(false);

    dispose();
  });

  test("auto-pauses on visibilitychange when hidden, resumes when visible", () => {
    const { spinner, dispose } = createRoot(dispose => ({
      spinner: createFaviconAnimation(frames, { interval: 100 }),
      dispose,
    }));
    flush();
    expect(spinner.playing()).toBe(true);

    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
    flush();
    expect(spinner.playing()).toBe(false);

    vi.advanceTimersByTime(300);
    flush();
    expect(spinner.frame()).toBe(0);

    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
    flush();
    expect(spinner.playing()).toBe(true);

    vi.advanceTimersByTime(100);
    flush();
    expect(spinner.frame()).toBe(1);

    dispose();
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
  });

  test("does not resume on visible if it was manually paused while hidden was false", () => {
    const { spinner, dispose } = createRoot(dispose => ({
      spinner: createFaviconAnimation(frames, { interval: 100 }),
      dispose,
    }));
    spinner.pause();
    flush();

    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
    flush();

    expect(spinner.playing()).toBe(false);

    dispose();
  });
});
