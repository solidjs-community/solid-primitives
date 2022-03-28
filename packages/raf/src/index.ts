import { Fn, isFunction, MaybeAccessor } from "@solid-primitives/utils";
import { createSignal, createMemo, Accessor, onCleanup } from "solid-js";

/**
 * A primitive creating reactive `window.requestAnimationFrame`, that is automatically disposed onCleanup.
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/raf#createRAF
 * @param callback The callback to run each frame
 * @returns Returns a signal if currently running as well as start and stop methods
 * ```ts
 * [running: Accessor<boolean>, start: Fn, stop: Fn]
 * ```
 *
 * @example
 * const [running, start, stop] = createRAF((timestamp) => {
 *    el.style.transform = "translateX(...)"
 * });
 */
function createRAF(
  callback: FrameRequestCallback
): [running: Accessor<boolean>, start: Fn, stop: Fn] {
  const [running, setRunning] = createSignal(false);
  let requestID = 0;

  const loop: FrameRequestCallback = timeStamp => {
    requestID = requestAnimationFrame(loop);
    callback(timeStamp);
  };
  const start = () => {
    if (running()) return;
    setRunning(true);
    requestID = requestAnimationFrame(loop);
  };
  const stop = () => {
    setRunning(false);
    cancelAnimationFrame(requestID);
  };

  onCleanup(stop);
  return [running, start, stop];
}

/**
 * A primitive for wrapping `window.requestAnimationFrame` callback function to limit the execution of the callback to specified number of FPS.
 *
 * Keep in mind that limiting FPS is achieved by not executing a callback if the frames are above defined limit. This can lead to not consistant frame duration.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/raf#targetFPS
 * @param callback The callback to run each *allowed* frame
 * @param fps The target FPS limit
 * @returns Wrapped RAF callback
 *
 * @example
 * const [running, start, stop] = createRAF(
 *   targetFPS(() => {...}, 60)
 * );
 */
function targetFPS(
  callback: FrameRequestCallback,
  fps: MaybeAccessor<number>
): FrameRequestCallback {
  const interval = isFunction(fps)
    ? createMemo(() => Math.floor(1000 / (fps as Accessor<number>)()))
    : (() => {
        const interval = Math.floor(1000 / fps);
        return () => interval;
      })();

  let elapsed = 0;
  let lastRun = 0;
  let missedBy = 0;

  return timeStamp => {
    elapsed = timeStamp - lastRun;
    if (Math.ceil(elapsed + missedBy) >= interval()) {
      lastRun = timeStamp;
      missedBy = Math.max(elapsed - interval(), 0);
      callback(timeStamp);
    }
  };
}

export { createRAF, createRAF as default, targetFPS };
