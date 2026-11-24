import { createSignal, createEffect, type Accessor } from "solid-js";
import { type MaybeAccessor, asAccessor, INTERNAL_OPTIONS } from "@solid-primitives/utils";

type ScrollAxis = "block" | "inline" | "x" | "y";
declare const ScrollTimeline: new (options?: {
  source?: Element;
  axis?: ScrollAxis;
}) => AnimationTimeline;

export type ScrollAnimationOptions = Omit<KeyframeAnimationOptions, "timeline"> & {
  /** Scrolling container. Defaults to the document root scroller. */
  source?: Element;
  axis?: ScrollAxis;
};

/**
 * Plays a scroll-driven WAAPI animation on `el` via `ScrollTimeline`.
 * Throws a `ReferenceError` where `ScrollTimeline` is unsupported; `createScrollAnimation`
 * returns `undefined` there instead.
 */
export function makeScrollAnimation(
  el: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
  options?: ScrollAnimationOptions,
): Animation {
  const { source, axis, ...animOptions } = options ?? {};
  return el.animate(keyframes, {
    ...animOptions,
    timeline: new ScrollTimeline({
      ...(source !== undefined && { source }),
      ...(axis !== undefined && { axis }),
    }),
  });
}

/**
 * Reactive wrapper around {@link makeScrollAnimation}. Yields `undefined` (no animation) when
 * `ScrollTimeline` is unsupported. Re-runs whenever
 * `target`, `keyframes`, or `options` change.
 */
export function createScrollAnimation(
  target: Accessor<Element | null | undefined>,
  keyframes: MaybeAccessor<Keyframe[] | PropertyIndexedKeyframes | null>,
  options?: MaybeAccessor<ScrollAnimationOptions>,
): Accessor<Animation | undefined> {
  const getKf = asAccessor(keyframes);
  const getOpts = typeof options === "function" ? options : () => options;
  const [animation, setAnimation] = createSignal<Animation | undefined>(
    undefined,
    INTERNAL_OPTIONS,
  );

  createEffect(
    () => ({ el: target(), kf: getKf(), opts: getOpts() }),
    ({ el, kf, opts }) => {
      if (!el || typeof ScrollTimeline === "undefined") {
        setAnimation(undefined);
        return;
      }
      const anim = makeScrollAnimation(el, kf, opts);
      setAnimation(anim);
      return () => anim.cancel();
    },
  );

  return animation;
}
