import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { ReactiveSet } from "@solid-primitives/set";
import { access, type MaybeAccessor, noop } from "@solid-primitives/utils";
import { createSignal, createMemo, type Accessor, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

/**
 * A primitive creating reactive `window.requestAnimationFrame`, that is automatically disposed onCleanup.
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/raf#createRAF
 * @param callback The callback to run each frame
 * @returns Returns a signal if currently running as well as start and stop methods
 * ```ts
 * [running: Accessor<boolean>, start: VoidFunction, stop: VoidFunction]
 * ```
 *
 * @example
 * const [running, start, stop] = createRAF((timestamp) => {
 *    el.style.transform = "translateX(...)"
 * });
 */
function createRAF(
  callback: FrameRequestCallback,
): [running: Accessor<boolean>, start: VoidFunction, stop: VoidFunction] {
  if (isServer) {
    return [() => false, noop, noop];
  }
  const [running, setRunning] = createSignal(false);
  let requestID: number | null = null;

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
    if (requestID !== null) cancelAnimationFrame(requestID);
  };

  onCleanup(stop);
  return [running, start, stop];
}

/**
 * Returns an advanced primitive factory function (that has an API similar to `createRAF`) to handle multiple animation frame callbacks in a single batched `requestAnimationFrame`, avoiding the overhead of scheduling multiple animation frames outside of a batch and making them all sync on the same delta.
 *
 * This is a [singleton root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) primitive.
 *
 * @returns Returns a factory function that works like `createRAF` but handles all scheduling in the same frame batch and optionally automatically starts and stops the global loop.
 * ```ts
 * (callback: FrameRequestCallback, automatic?: boolean) => [queued: Accessor<boolean>, queue: VoidFunction, dequeue: VoidFunction, running: Accessor<boolean>, start: VoidFunction, stop: VoidFunction]
 * ```
 *
 * @example
 * const createScheduledFrame = useFrameloop();
 *
 * const [queued, queue, dequeue, running, start, stop] = createScheduledFrame(() => {
 *   el.style.transform = "translateX(...)"
 * });
 */
const useFrameloop = createHydratableSingletonRoot<
  (
    callback: FrameRequestCallback,
    automatic?: MaybeAccessor<boolean>,
  ) => [
    queued: Accessor<boolean>,
    queue: VoidFunction,
    dequeue: VoidFunction,
    running: Accessor<boolean>,
    start: VoidFunction,
    stop: VoidFunction,
  ]
>(() => {
  if (isServer) return () => [() => false, noop, noop, () => false, noop, noop];

  const frameCallbacks = new ReactiveSet<FrameRequestCallback>();

  const [running, start, stop] = createRAF(delta => {
    frameCallbacks.forEach(frameCallback => {
      frameCallback(delta);
    });
  });

  return function createFrame(callback: FrameRequestCallback, automatic = false) {
    const queued = () => frameCallbacks.has(callback);
    const queue = () => {
      frameCallbacks.add(callback);
      if (access(automatic) && !running()) start();
    };
    const dequeue = () => {
      frameCallbacks.delete(callback);
      if (running() && frameCallbacks.size === 0) stop();
    };

    onCleanup(dequeue);
    return [queued, queue, dequeue, running, start, stop];
  };
});

/**
 * An advanced primitive creating reactive scheduled frameloops, for example [motion's frame util](https://motion.dev/docs/frame), that are automatically disposed onCleanup.
 *
 * The idea behind this is for more complex use cases, where you need scheduling and want to avoid potential issues arising from running more than one `requestAnimationFrame`.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/raf#createScheduledFrameloop
 * @param schedule The function that receives the callback and handles scheduling the frameloop
 * @param cancel The function that cancels the scheduled callback
 * @param callback The callback to run each scheduled frame
 * @returns Returns a signal if currently running as well as start and stop methods
 * ```ts
 * [running: Accessor<boolean>, start: VoidFunction, stop: VoidFunction]
 * ```
 *
 * @example
 * import { type FrameData, cancelFrame, frame } from "motion";
 *
 * const [running, start, stop] = createScheduledFrameloop(
 *   callback => frame.update(callback, true),
 *   cancelFrame,
 *   (data: FrameData) => {
 *     // Do something with the data.delta during the `update` phase.
 *   },
 * );
 */
function createScheduledFrameloop<
  RequestID extends NonNullable<unknown>,
  Callback extends (...args: Array<any>) => any,
>(
  schedule: (callback: Callback) => RequestID,
  cancel: (requestID: RequestID) => void,
  callback: Callback,
): [running: Accessor<boolean>, start: VoidFunction, stop: VoidFunction] {
  if (isServer) {
    return [() => false, noop, noop];
  }
  const [running, setRunning] = createSignal(false);
  let requestID: RequestID | null = null;

  const start = () => {
    if (running()) return;
    setRunning(true);
    requestID = schedule(callback);
  };
  const stop = () => {
    setRunning(false);
    if (requestID !== null) cancel(requestID);
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
  fps: MaybeAccessor<number>,
): FrameRequestCallback {
  if (isServer) {
    return callback;
  }
  const interval =
    typeof fps === "function"
      ? createMemo(() => Math.floor(1000 / fps()))
      : (() => {
          const newInterval = Math.floor(1000 / fps);
          return () => newInterval;
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

export type MsCounter = (() => number) & {
  reset: () => void;
  running: () => boolean;
  start: () => void;
  stop: () => void;
};

/**
 * A primitive that creates a signal counting up milliseconds with a given frame rate to base your animations on.
 *
 * @param fps the frame rate, either as Accessor or number
 * @param limit an optional limit, either as Accessor or number, after which the counter is reset
 *
 * @returns an Accessor returning the current number of milliseconds and the following methods:
 * - `reset()`: manually resetting the counter
 * - `running()`: returns if the counter is currently setRunning
 * - `start()`: restarts the counter if stopped
 * - `stop()`: stops the counter if running
 *
 * ```ts
 * const ms = createMs(60);
 * createEffect(() => ms() > 500000 ? ms.stop());
 * return <rect x="0" y="0" height="10" width={Math.min(100, ms() / 5000)} />
 * ```
 */
function createMs(fps: MaybeAccessor<number>, limit?: MaybeAccessor<number>): MsCounter {
  const [ms, setMs] = createSignal(0);
  let initialTs = 0;
  const reset = () => {
    initialTs = 0;
  };
  const [running, start, stop] = createRAF(
    targetFPS(ts => {
      initialTs ||= ts;
      const ms = ts - initialTs;
      setMs(ts - initialTs);
      if (ms === (typeof limit === "function" ? limit() : limit)) reset();
    }, fps),
  );
  start();
  onCleanup(stop);
  return Object.assign(ms, { reset, running, start, stop });
}

export {
  createMs,
  createRAF,
  createRAF as default,
  createScheduledFrameloop,
  targetFPS,
  useFrameloop,
};
