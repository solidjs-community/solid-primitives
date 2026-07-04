import { type Accessor, createEffect, createSignal, onCleanup, untrack } from "solid-js";
import { isServer } from "@solidjs/web";
import { INTERNAL_OPTIONS, noop } from "@solid-primitives/utils";

/**
 * Wraps `HTMLVideoElement.requestVideoFrameCallback`, which fires once per
 * displayed video frame rather than once per display refresh — it stops
 * naturally while the video is paused, and the `metadata` argument (e.g.
 * `mediaTime`, `presentedFrames`) lets you sync work to actual playback
 * instead of wall-clock time.
 *
 * Non-reactive — no Solid owner required. Returns a cleanup function.
 *
 * @see https://wicg.github.io/video-rvfc/
 * @param video The video element to observe
 * @param callback Invoked once per presented frame with its timestamp and metadata
 * @returns Tuple of `[running, start, stop]`
 *
 * @example
 * ```ts
 * const [player, cleanup] = makeVideo("clip.mp4");
 * const [running, start, stop] = makeVideoFrameCallback(player, (now, metadata) => {
 *   draw(metadata.mediaTime);
 * });
 * start();
 * cleanup();
 * ```
 */
export const makeVideoFrameCallback = (
  video: HTMLVideoElement,
  callback: VideoFrameRequestCallback,
): [running: () => boolean, start: VoidFunction, stop: VoidFunction] => {
  if (isServer) return [() => false, noop, noop];

  let handle = 0;
  let running = false;

  const loop: VideoFrameRequestCallback = (now, metadata) => {
    handle = video.requestVideoFrameCallback(loop);
    callback(now, metadata);
  };

  const start = () => {
    if (running) return;
    running = true;
    handle = video.requestVideoFrameCallback(loop);
  };

  const stop = () => {
    if (!running) return;
    running = false;
    video.cancelVideoFrameCallback(handle);
  };

  return [() => running, start, stop];
};

/**
 * A reactive `requestVideoFrameCallback`, automatically stopped `onCleanup`.
 * Re-attaches to the current element whenever `el()` changes, and stops
 * cleanly if it becomes `undefined`.
 *
 * @see https://wicg.github.io/video-rvfc/
 * @param el Accessor for the video element to observe
 * @param callback Invoked once per presented frame with its timestamp and metadata
 * @returns Tuple of `[running, start, stop]`
 *
 * @example
 * ```ts
 * const video = createVideo("clip.mp4");
 * const [running, start, stop] = createVideoFrameCallback(() => video.player, (now, metadata) => {
 *   console.log(metadata.presentedFrames);
 * });
 * start();
 * ```
 */
export const createVideoFrameCallback = (
  el: Accessor<HTMLVideoElement | undefined>,
  callback: VideoFrameRequestCallback,
): [running: Accessor<boolean>, start: VoidFunction, stop: VoidFunction] => {
  if (isServer) return [() => false, noop, noop];

  const [running, setRunning] = createSignal(false, INTERNAL_OPTIONS);

  let active = false;
  let startCurrent: VoidFunction = noop;
  let stopCurrent: VoidFunction = noop;

  const attach = (video: HTMLVideoElement | undefined) => {
    stopCurrent();
    startCurrent = noop;
    stopCurrent = noop;
    if (!video) return;
    const [, startBase, stopBase] = makeVideoFrameCallback(video, callback);
    startCurrent = startBase;
    stopCurrent = stopBase;
    if (active) startCurrent();
  };

  attach(untrack(el));

  let prevEl = untrack(el);
  createEffect(el, nextEl => {
    if (nextEl !== prevEl) {
      prevEl = nextEl;
      attach(nextEl);
    }
  });

  const start = () => {
    active = true;
    setRunning(true);
    startCurrent();
  };
  const stop = () => {
    active = false;
    setRunning(false);
    stopCurrent();
  };

  onCleanup(stop);

  return [running, start, stop];
};
