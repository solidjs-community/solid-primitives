import { createSignal, onMount, onCleanup, createMemo } from "solid-js";

export type FPS = number | Function;
const getFps = (fps: FPS) => (typeof fps === "function" ? fps() : fps);
const calcFpsInterval = (fps: number) => 1000 / fps;

/**
 * Creates a method to support RAF.
 * Based on useRafFN (https://github.com/microcipcip/vue-use-kit/blob/master/src/functions/useRafFn/useRafFn.ts).
 *
 * @param callback The callback to run on a frame
 * @param fps Target frame rate, defaults to 60
 * @param runImmediately Determines if the function could run immediately
 * @returns Returns a signal if currently running as well as star tand stop methods
 *
 * @example
 */
const createRAF = (
  callback: (timeElapse: number) => void,
  fps: FPS = 60,
  runImmediately = true
): [running: () => boolean, start: () => void, stop: () => void] => {
  const [running, setRunning] = createSignal(false);
  const fpsInterval = createMemo(() => calcFpsInterval(getFps(fps)));
  let wasIdle = false;
  let startTime = 0;
  let timeElapsed = 0;
  let timePaused = 0;
  let timeDelta = 0;
  const loop = (timeStamp: number) => {
    if (!startTime) startTime = timeStamp;
    if (!running()) return;
    if (wasIdle) {
      timePaused = timeStamp - startTime - timeElapsed;
      wasIdle = false;
    }
    timeElapsed = timeStamp - startTime - timePaused;
    const shouldRun = getFps(fps) >= 60;
    if (shouldRun) {
      timeDelta = timeElapsed;
      callback(timeElapsed);
    }
    if (!shouldRun) {
      const elapsedTimeFromPrevLoop = Math.ceil(timeElapsed - timeDelta);
      if (elapsedTimeFromPrevLoop > fpsInterval()) {
        timeDelta = timeElapsed;
        callback(timeElapsed);
      }
    }
    requestAnimationFrame(loop);
  };
  const start = () => {
    if (running()) return;
    setRunning(true);
    requestAnimationFrame(loop);
  };
  const stop = () => {
    setRunning(false);
    wasIdle = true;
  };
  onMount(() => runImmediately && start());
  onCleanup(stop);
  return [running, start, stop];
};

export default createRAF;
