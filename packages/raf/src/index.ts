import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { ReactiveSet } from "@solid-primitives/set";
import { access, type MaybeAccessor, noop } from "@solid-primitives/utils";
import { createSignal, createMemo, untrack, type Accessor, onCleanup } from "solid-js";
import { isServer } from "@solidjs/web";

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
  const [running, setRunning] = createSignal(false, { ownedWrite: true });
  let requestID: number | null = null;

  const loop: FrameRequestCallback = timeStamp => {
    requestID = requestAnimationFrame(loop);
    callback(timeStamp);
  };
  const start = () => {
    // check the request, not `running()`: a signal write stays pending until the next flush, so
    // two `start()` calls in the same tick would both see `false` and start two loops. Reading
    // no signal also keeps a tracking caller (e.g. `createMs` in a memo) from subscribing to it
    if (requestID !== null) return;
    setRunning(true);
    requestID = requestAnimationFrame(loop);
  };
  const stop = () => {
    setRunning(false);
    // only cancel a request that was actually made (`0` used to stand for "none")
    if (requestID !== null) {
      cancelAnimationFrame(requestID);
      requestID = null;
    }
  };

  onCleanup(stop);
  return [running, start, stop];
}

/**
 * A primitive for executing multiple callbacks at once, intended for usage in conjunction with primitives like `createRAF`.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/raf#createCallbacksSet
 * @param initialCallbacks callbacks to start the set with
 * @returns a callback that calls every callback in the set with the same arguments, and the `ReactiveSet` holding them
 * ```ts
 * [callback: (...args: Parameters<T>) => void, callbacksSet: ReactiveSet<T>]
 * ```
 *
 * @example
 * const [callback, callbacks] = createCallbacksSet<FrameRequestCallback>();
 * const [running, start, stop] = createRAF(callback);
 * callbacks.add(ts => el.style.opacity = ...);
 */
function createCallbacksSet<T extends (...args: any) => void>(
  ...initialCallbacks: Array<T>
): [callback: (...args: Parameters<T>) => void, callbacksSet: ReactiveSet<T>] {
  const callbacksSet = new ReactiveSet(initialCallbacks);

  return [(...args) => callbacksSet.forEach(callback => callback(...args)), callbacksSet];
}

export type GlobalRAFCallbackFactory = (
  callback: FrameRequestCallback,
  startWhenAdded?: MaybeAccessor<boolean>,
) => [
  added: Accessor<boolean>,
  add: VoidFunction,
  remove: VoidFunction,
  running: Accessor<boolean>,
  start: VoidFunction,
  stop: VoidFunction,
];

/**
 * Returns a factory for callbacks that share one global `requestAnimationFrame` loop, so they all
 * run in the same frame with the same timestamp. The loop lives in a singleton root.
 *
 * Each call returns `[added, add, remove, running, start, stop]`: the first three control whether
 * the callback is in the shared loop, the last three control the shared loop itself.
 * Pass `startWhenAdded` to start the loop when the callback is added. The loop stops when the last
 * callback is removed. Callbacks are removed on cleanup.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/raf#useGlobalRAF
 *
 * @example
 * const createGlobalRAFCallback = useGlobalRAF();
 * const [added, add, remove, running, start, stop] = createGlobalRAFCallback(
 *   targetFPS(() => el.style.transform = "translateX(...)", 60),
 *   true,
 * );
 */
const useGlobalRAF: () => GlobalRAFCallbackFactory =
  createHydratableSingletonRoot<GlobalRAFCallbackFactory>(() => {
    if (isServer) return () => [() => false, noop, noop, () => false, noop, noop];

    const [callback, callbacksSet] = createCallbacksSet<FrameRequestCallback>();
    const [running, start, stop] = createRAF(callback);

    return function createGlobalRAFCallback(
      callback: FrameRequestCallback,
      startWhenAdded: MaybeAccessor<boolean> = false,
    ) {
      // a separate entry per call, so registering the same `callback` from two owners doesn't let
      // one owner's `remove` (or cleanup) unregister the other
      const entry: FrameRequestCallback = timeStamp => callback(timeStamp);
      const added = () => callbacksSet.has(entry);
      // `start`/`stop` are no-ops when already started/stopped, so don't check `running()`: its
      // value is stale until the next flush. Untracked so a tracking caller doesn't subscribe to
      // the set it is writing
      const add = () =>
        untrack(() => {
          callbacksSet.add(entry);
          if (access(startWhenAdded)) start();
        });
      const remove = () =>
        untrack(() => {
          if (callbacksSet.delete(entry) && callbacksSet.size === 0) stop();
        });

      onCleanup(remove);
      return [added, add, remove, running, start, stop];
    };
  });

/**
 * A primitive for driving an external frameloop scheduler (for example [motion's `frame`](https://motion.dev/docs/frame))
 * with the same `[running, start, stop]` shape as `createRAF`. The loop is stopped on cleanup.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/raf#createScheduledLoop
 * @param schedule Receives the callback and schedules it to run every frame until cancelled, returning the ID that `cancel` needs. Must not return `null` or `undefined`. It is called once per `start()`, so a one-shot scheduler such as `requestAnimationFrame` only runs the callback once; use `createRAF` for that.
 * @param cancel Cancels the scheduled callback using the ID returned by `schedule`.
 * @returns a function that receives a callback and returns
 * ```ts
 * [running: Accessor<boolean>, start: VoidFunction, stop: VoidFunction]
 * ```
 *
 * @example
 * import { cancelFrame, frame } from "motion";
 *
 * // motion's `frame.render` returns the callback it scheduled, which is what `cancelFrame` takes
 * const createMotionFrameRender = createScheduledLoop(
 *   callback => frame.render(callback, true),
 *   cancelFrame,
 * );
 * const [running, start, stop] = createMotionFrameRender(
 *   data => (element.style.transform = "translateX(...)"),
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
    const [running, setRunning] = createSignal(false, { ownedWrite: true });
    let requestID: RequestID | null = null;

    const start = () => {
      if (requestID !== null) return;
      setRunning(true);
      requestID = schedule(callback);
    };
    const stop = () => {
      setRunning(false);
      if (requestID !== null) {
        cancel(requestID);
        requestID = null;
      }
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
 * createEffect(
 *   () => ms() > 500000,
 *   done => done && ms.stop(),
 * );
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
  createCallbacksSet,
  createMs,
  createRAF,
  createRAF as default,
  createScheduledLoop,
  targetFPS,
  useGlobalRAF,
};
