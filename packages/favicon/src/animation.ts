import { type Accessor, createEffect, createSignal, onCleanup, untrack } from "solid-js";
import { isServer } from "@solidjs/web";
import { access, INTERNAL_OPTIONS, type MaybeAccessor, noop } from "@solid-primitives/utils";
import { makeEventListener } from "@solid-primitives/event-listener";
import { makeFavicon } from "./favicon.ts";
import type { FaviconOptions } from "./link.ts";

export type FaviconAnimationOptions = {
  /** Milliseconds between frames. @default 200 */
  interval?: number;
  /** Start cycling immediately. @default true */
  autoplay?: boolean;
  /** Loop back to the first frame after the last. @default true */
  loop?: boolean;
} & FaviconOptions;

export type FaviconAnimationController = {
  /** The href of the currently-displayed frame. */
  readonly href: string;
  /** Index of the currently-displayed frame. */
  readonly frame: number;
  readonly playing: boolean;
  play: () => void;
  pause: () => void;
  dispose: () => void;
};

/** Returns the next frame index, or `undefined` when a non-looping sequence has ended. */
function nextFrameIndex(frame: number, length: number, loop: boolean): number | undefined {
  const next = frame + 1;
  if (next < length) return next;
  return loop ? 0 : undefined;
}

/**
 * Cycles the document favicon through `frames` on an interval — for build-status spinners,
 * "recording" pulses, and similar loading indicators.
 *
 * Non-reactive: `frames` is a plain array, read once. For a reactive, auto-pausing-on-hidden-tab
 * version see {@link createFaviconAnimation}.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/favicon#makeFaviconAnimation
 * @example
 * const anim = makeFaviconAnimation(["/spin-1.png", "/spin-2.png", "/spin-3.png"]);
 * anim.pause();
 * anim.dispose(); // restores the previous favicon
 */
export function makeFaviconAnimation(
  frames: readonly string[],
  options: FaviconAnimationOptions = {},
): FaviconAnimationController {
  const { interval = 200, autoplay = true, loop = true, ...faviconOptions } = options;

  if (isServer || frames.length === 0) {
    return {
      href: frames[0] ?? "",
      frame: 0,
      playing: false,
      play: noop,
      pause: noop,
      dispose: noop,
    };
  }

  const favicon = makeFavicon(frames[0]!, faviconOptions);
  let frame = 0;
  let playing = false;
  let timer: ReturnType<typeof setInterval> | undefined;

  function tick(): void {
    const next = nextFrameIndex(frame, frames.length, loop);
    if (next === undefined) {
      pause();
      return;
    }
    frame = next;
    favicon.setHref(frames[frame]!);
  }

  function play(): void {
    if (playing || frames.length <= 1) return;
    playing = true;
    timer = setInterval(tick, interval);
  }

  function pause(): void {
    playing = false;
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  }

  if (autoplay) play();

  return {
    get href() {
      return favicon.href;
    },
    get frame() {
      return frame;
    },
    get playing() {
      return playing;
    },
    play,
    pause,
    dispose() {
      pause();
      favicon.dispose();
    },
  };
}

/**
 * Reactively cycles the document favicon through `frames` on an interval. Automatically pauses
 * while the tab is hidden (`document.visibilitychange`) and resumes if it was playing before, so
 * a backgrounded tab doesn't keep repainting an icon nobody can see. Restores the previous
 * favicon on cleanup.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/favicon#createFaviconAnimation
 * @example
 * const spinner = createFaviconAnimation(["/spin-1.png", "/spin-2.png", "/spin-3.png"]);
 * spinner.pause();
 */
export function createFaviconAnimation(
  frames: MaybeAccessor<readonly string[]>,
  options: FaviconAnimationOptions = {},
): {
  frame: Accessor<number>;
  playing: Accessor<boolean>;
  play: () => void;
  pause: () => void;
} {
  if (isServer) {
    return { frame: () => 0, playing: () => false, play: noop, pause: noop };
  }

  const { interval = 200, autoplay = true, loop = true, ...faviconOptions } = options;

  const [frame, setFrame] = createSignal(0, INTERNAL_OPTIONS);
  const [playing, setPlaying] = createSignal(false, INTERNAL_OPTIONS);

  // `untrack` — read outside JSX/a memo/an effect's compute phase would otherwise trip Solid's
  // `STRICT_READ_UNTRACKED` dev diagnostic.
  let list = untrack(() => access(frames));
  const favicon = makeFavicon(list[0] ?? "", faviconOptions);
  let timer: ReturnType<typeof setInterval> | undefined;

  // Every read below is a plain imperative "what's the current value" check from outside a
  // tracked context (a timer callback, an event handler, or setup code) — `untrack` keeps it
  // from accidentally registering a dependency on whatever computation happens to be active
  // when these functions are called (and avoids Solid's `STRICT_READ_UNTRACKED` dev diagnostic).
  function tick(): void {
    const next = nextFrameIndex(untrack(frame), list.length, loop);
    if (next === undefined) {
      pause();
      return;
    }
    setFrame(next);
    favicon.setHref(list[next]!);
  }

  function play(): void {
    if (untrack(playing) || list.length <= 1) return;
    setPlaying(true);
    timer = setInterval(tick, interval);
  }

  function pause(): void {
    setPlaying(false);
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  }

  if (typeof frames === "function") {
    // `defer: true` — the initial list was already applied synchronously above; without this,
    // the effect's un-deferred first run would re-apply frame 0 on top of whatever `autoplay`
    // had already ticked forward.
    createEffect(
      () => frames(),
      newList => {
        list = newList;
        setFrame(0);
        favicon.setHref(list[0] ?? "");
        if (list.length <= 1) {
          if (untrack(playing)) pause();
        } else if (autoplay && !untrack(playing)) {
          play();
        }
      },
      { defer: true },
    );
  }

  let wasPlayingBeforeHidden = false;
  makeEventListener(document, "visibilitychange", () => {
    if (document.hidden) {
      wasPlayingBeforeHidden = untrack(playing);
      if (wasPlayingBeforeHidden) pause();
    } else if (wasPlayingBeforeHidden) {
      wasPlayingBeforeHidden = false;
      play();
    }
  });

  if (autoplay) play();

  onCleanup(() => {
    pause();
    favicon.dispose();
  });

  return { frame, playing, play, pause };
}
