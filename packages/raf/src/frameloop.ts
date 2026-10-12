import { createSignal, onCleanup, type Accessor } from "solid-js";
import { isServer } from "solid-js/web";

export interface FrameState {
  delta: number;
  elapsed: number;
  timestamp: number;
}

export type FrameLoopCallback = (state: FrameState) => void;

export interface FrameLoopOptions {
  autoPauseOnHidden?: boolean;
  maxDelta?: number;
  immediate?: boolean;
}

export interface FrameLoopReturn {
  isRunning: Accessor<boolean>;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

export function createFrameLoop(
  callback: FrameLoopCallback,
  options: FrameLoopOptions = {},
): FrameLoopReturn {
  if (isServer || typeof window === "undefined") {
    return {
      isRunning: () => false,
      start: () => {},
      stop: () => {},
      toggle: () => {},
    };
  }

  const autoPause = options.autoPauseOnHidden ?? true;
  const maxDelta = options.maxDelta ?? 0.1;
  const immediate = options.immediate ?? true;

  const [isRunning, setIsRunning] = createSignal(false);

  let rafId: number | null = null;
  let lastTimestamp = 0;
  let totalElapsed = 0;
  let userPaused = !immediate;

  const tick = (now: number) => {
    if (!lastTimestamp) {
      lastTimestamp = now;
    }
    const rawDelta = (now - lastTimestamp) / 1000;
    const delta = Math.min(rawDelta, maxDelta);
    totalElapsed += delta;
    lastTimestamp = now;

    callback({
      delta,
      elapsed: totalElapsed,
      timestamp: now,
    });

    rafId = requestAnimationFrame(tick);
  };

  const start = () => {
    userPaused = false;
    if (rafId !== null) return;
    setIsRunning(true);
    lastTimestamp = 0;
    rafId = requestAnimationFrame(tick);
  };

  const stop = () => {
    userPaused = true;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    setIsRunning(false);
  };

  const toggle = () => {
    if (isRunning()) stop();
    else start();
  };

  if (autoPause) {
    const onVisibilityChange = () => {
      if (document.hidden) {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
          setIsRunning(false);
        }
      } else if (!userPaused) {
        if (rafId === null) {
          lastTimestamp = 0;
          setIsRunning(true);
          rafId = requestAnimationFrame(tick);
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    onCleanup(() => document.removeEventListener("visibilitychange", onVisibilityChange));
  }

  if (immediate) {
    start();
  }

  onCleanup(() => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  return {
    isRunning,
    start,
    stop,
    toggle,
  };
}
