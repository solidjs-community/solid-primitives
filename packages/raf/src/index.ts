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
 * A primitive for executing multiple callbacks at once, intended for usage in conjunction with primitives like `createRAF`.
 * @param initialCallbacks
 * @returns a main callback function that executes all the callbacks at once, as well as the `ReactiveSet` that contains all the callbacks
 * ```ts
 * [callback: T, callbacksSet: ReactiveSet<T>]
 * ```
 */
function createCallbacksSet<T extends (...args: any) => void>(
  ...initialCallbacks: Array<T>
): [callback: T, callbacksSet: ReactiveSet<T>] {
  const callbacksSet = new ReactiveSet(initialCallbacks);

  return [((...args) => callbacksSet.forEach(callback => callback(...args))) as T, callbacksSet];
}

/**
 * A singleton root that returns a function similar to `createRAF` that batches multiple `window.requestAnimationFrame` executions within the same same timestamp (same RAF cycle) instead of skipping requests in separate frames. This is done by using a single `createRAF` in a [singleton root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) in conjuction with [`createCallbacksSet`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/raf#createCallbacksSet)
 *
 * @returns Returns a factory function that works like `createRAF` with an additional parameter to start the global RAF loop when adding the callback to the callbacks set. This function return is also similar to `createRAF`, but it's first three elements of the tuple are related to the presence of the callback in the callbacks set, while the next three are the same as `createRAF`, but for the global loop that executes all the callbacks present in the callbacks set.
 * ```ts
 * (callback: FrameRequestCallback, startWhenAdded?: boolean) => [added: Accessor<boolean>, add: VoidFunction, remove: VoidFunction, running: Accessor<boolean>, start: VoidFunction, stop: VoidFunction]
 * ```
 *
 * @example
 * const createGlobalRAFCallback = useGlobalRAF();
 *
 * const [added, add, remove, running, start, stop] = createGlobalRAFCallback(() => {
 *   el.style.transform = "translateX(...)"
 * });
 *
 * // Usage with targetFPS
 * const [added, add, remove, running, start, stop] = createGlobalRAFCallback(targetFPS(() => {
 *   el.style.transform = "translateX(...)"
 * }, 60));
 */
const useGlobalRAF = createHydratableSingletonRoot<
  (
    callback: FrameRequestCallback,
    startWhenAdded?: MaybeAccessor<boolean>,
  ) => [
    added: Accessor<boolean>,
    add: VoidFunction,
    remove: VoidFunction,
    running: Accessor<boolean>,
    start: VoidFunction,
    stop: VoidFunction,
  ]
>(() => {
  if (isServer) return () => [() => false, noop, noop, () => false, noop, noop];

  const [callback, callbacksSet] = createCallbacksSet<FrameRequestCallback>();
  const [running, start, stop] = createRAF(callback);

  return function createGlobalRAFCallback(callback: FrameRequestCallback, startWhenAdded = false) {
    const added = () => callbacksSet.has(callback);
    const add = () => {
      callbacksSet.add(callback);
      if (access(startWhenAdded) && !running()) start();
    };
    const remove = () => {
      callbacksSet.delete(callback);
      if (running() && callbacksSet.size === 0) stop();
    };

    onCleanup(remove);
    return [added, add, remove, running, start, stop];
  };
});

/**
 * A primitive for creating reactive interactions with external frameloop related functions (for example using [motion's frame util](https://motion.dev/docs/frame)) that are automatically disposed onCleanup.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/raf#createScheduledLoop
 * @param schedule The function that receives the callback and handles it's loop scheduling, returning a requestID that is used to cancel the loop
 * @param cancel The function that cancels the scheduled callback using the requestID.
 * @returns Returns a function that receives a callback that's compatible with the provided scheduler and returns a signal if currently running as well as start and stop methods
 * ```ts
 * (callback: Callback) => [running: Accessor<boolean>, start: VoidFunction, stop: VoidFunction]
 * ```
 *
 * @example
 * import { cancelFrame, frame } from "motion";
 *
 * const createMotionFrameRender = createScheduledLoop(
 *   callback => frame.render(callback, true),
 *   cancelFrame,
 * );
 * const [running, start, stop] = createMotionFrameRender(
 *    data => element.style.transform = "translateX(...)"
 * );
 *
 * // Alternative syntax (for a single execution in place):
 * import { cancelFrame, frame } from "motion";
 *
 * const [running, start, stop] = createScheduledLoop(
 *   callback => frame.render(callback, true),
 *   cancelFrame,
 * )(
 *    data => element.style.transform = "translateX(...)"
 * );
 */
function createScheduledLoop<
  RequestID extends NonNullable<unknown>,
  Callback extends (...args: Array<any>) => any,
>(
  schedule: (callback: Callback) => RequestID,
  cancel: (requestID: RequestID) => void,
): (callback: Callback) => [running: Accessor<boolean>, start: VoidFunction, stop: VoidFunction] {
  return (callback: Callback) => {
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
  };
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
  createCallbacksSet,
  createRAF,
  createRAF as default,
  createScheduledLoop,
  targetFPS,
  useGlobalRAF,
};
