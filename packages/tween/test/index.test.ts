import { createRoot, createSignal } from "solid-js";
import { describe, expect, it, vi, afterEach } from "vitest";
import createTween from "../src/index.js";

let _last_id = 0;
let _raf_callbacks_old = new Map<number, FrameRequestCallback>();
let _raf_callbacks_new = new Map<number, FrameRequestCallback>();

function _flush_raf(time: number) {
  _raf_callbacks_old = _raf_callbacks_new;
  _raf_callbacks_new = new Map();
  for (const callback of _raf_callbacks_old.values()) {
    callback(time);
  }
  _raf_callbacks_old.clear();
}

function _mocked_requestAnimationFrame(callback: FrameRequestCallback): number {
  const id = _last_id++;
  _raf_callbacks_new.set(id, callback);
  return id;
}
function _mocked_cancelAnimationFrame(id: number): void {
  _raf_callbacks_new.delete(id);
}

vi.stubGlobal("requestAnimationFrame", _mocked_requestAnimationFrame);
vi.stubGlobal("cancelAnimationFrame", _mocked_cancelAnimationFrame);

afterEach(() => {
  _raf_callbacks_old.clear();
  _raf_callbacks_new.clear();
  _last_id = 0;
});

describe("animation", () => {
  it("updates when its target changes", () => {
    const [source, setSource] = createSignal(0);
    let dispose!: () => void;
    let tweened!: () => number;
    createRoot(d => {
      dispose = d;
      tweened = createTween(source, {});
    });

    const start = performance.now();
    expect(tweened()).toBe(0);

    setSource(100);
    expect(tweened()).toBe(0);

    _flush_raf(start + 200);
    expect(tweened()).toBe(100);

    dispose();
  });

  it("uses a linear animation by default", () => {
    const [value, setValue] = createSignal(0);
    let dispose!: () => void;
    let tweened!: () => number;
    createRoot(d => {
      dispose = d;
      tweened = createTween(value, { duration: 100 });
    });

    const start = performance.now();
    setValue(100);
    expect(tweened()).toBe(0);

    _flush_raf(start + 25);
    expect(tweened()).toBeCloseTo(25, 0);

    _flush_raf(start + 50);
    expect(tweened()).toBeCloseTo(50, 0);

    _flush_raf(start + 75);
    expect(tweened()).toBeCloseTo(75, 0);

    _flush_raf(start + 100);
    expect(tweened()).toBeCloseTo(100, 0);

    dispose();
  });

  it("accepts custom easing functions", () => {
    const [value, setValue] = createSignal(0);
    let dispose!: () => void;
    let tweened!: () => number;
    createRoot(d => {
      dispose = d;
      tweened = createTween(value, { duration: 100, ease: t => t * t });
    });

    const start = performance.now();
    setValue(100);
    expect(tweened()).toBe(0);

    _flush_raf(start + 25);
    expect(tweened()).toBeCloseTo(6.25, 0);

    _flush_raf(start + 50);
    expect(tweened()).toBeCloseTo(25, 0);

    _flush_raf(start + 75);
    expect(tweened()).toBeCloseTo(56.25, 0);

    _flush_raf(start + 100);
    expect(tweened()).toBeCloseTo(100, 0);

    dispose();
  });

  it("can be interrupted part-way through an animation", () => {
    const [value, setValue] = createSignal(0);
    let dispose!: () => void;
    let tweened!: () => number;
    createRoot(d => {
      dispose = d;
      tweened = createTween(value, { duration: 1000 });
    });
    const start = performance.now();

    setValue(100);
    _flush_raf(start + 600);
    expect(tweened()).toBeCloseTo(60, 0);

    setValue(0);

    _flush_raf(start + 500);
    expect(tweened()).toBeCloseTo(30, 0);

    dispose();
  });
});
