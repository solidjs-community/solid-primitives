import { type MaybeAccessor, noop } from "@solid-primitives/utils";
import { createSignal, createMemo, type Accessor, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

export * from "./frameloop.js";

function createRAF(
  callback: FrameRequestCallback,
): [running: Accessor<boolean>, start: VoidFunction, stop: VoidFunction] {
  if (isServer) {
    return [() => false, noop, noop];
  }
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

export { createMs, createRAF, createRAF as default, targetFPS };
