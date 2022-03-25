import { createSignal, onCleanup, createMemo, createEffect } from "solid-js";

export type FPS = number | Function;
const getFps = (targetFps: FPS) => (typeof targetFps === "function" ? targetFps() : targetFps);
const calcFpsInterval = (targetFps: number) => Math.floor(1000 / targetFps);

/**
 * Creates a method to support RAF.
 * Based on useRafFN (https://github.com/microcipcip/vue-use-kit/blob/master/src/functions/useRafFn/useRafFn.ts).
 *
 * @param callback The callback to run on a frame
 * @param targetFps Target frame rate, defaults to Infinity
 * @returns Returns a signal if currently running as well as start and stop methods
 *
 * @example
 */
const createRAF = (
  callback: (timeStamp: number) => void,
  targetFps: FPS = Infinity
): [running: () => boolean, start: () => void, stop: () => void] => {

  const [running, setRunning] = createSignal(false);
  const fpsInterval = createMemo(() => calcFpsInterval(getFps(targetFps)));

  let elapsed = 0;
  let lastRun = 0;
  let missedBy = 0;

  let interval = fpsInterval();
  let fps = getFps(targetFps)
  createEffect(() => {
    interval = fpsInterval();
    fps = getFps(targetFps)
  });

  let isRunning = running();
  createEffect(() => {
    isRunning = running();
    lastRun = 0;
    missedBy = 0;
  });

  const loop = (timeStamp: number) => {
    if (!isRunning) return

    requestAnimationFrame(loop);

    if(fps === Infinity) {
      callback(timeStamp);
      return
    }

    elapsed = timeStamp - lastRun;
    if (Math.ceil(elapsed + missedBy) >= interval) {
      lastRun = timeStamp;
      missedBy = Math.max(elapsed - interval, 0)
      callback(timeStamp);
    }
  };
  const start = () => {
    if (running()) return;
    setRunning(true);
    requestAnimationFrame(loop);
  };
  const stop = () => {
    setRunning(false);
  };

  onCleanup(stop);
  return [running, start, stop];
};

export default createRAF;
