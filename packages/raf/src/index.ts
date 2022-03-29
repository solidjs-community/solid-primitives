import { Fn } from "@solid-primitives/utils";
import { createSignal, Accessor, onCleanup } from "solid-js";

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

export { createRAF, createRAF as default };
