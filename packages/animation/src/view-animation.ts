import { createSignal, createEffect, type Accessor } from "solid-js";
import { type MaybeAccessor, asAccessor, INTERNAL_OPTIONS } from "@solid-primitives/utils";

type ScrollAxis = "block" | "inline" | "x" | "y";
declare const ViewTimeline: new (options: {
  subject: Element;
  axis?: ScrollAxis;
  inset?: string | string[];
}) => AnimationTimeline;

export type ViewAnimationOptions = Omit<KeyframeAnimationOptions, "timeline"> & {
  /**
   * The element whose intersection with the scroll port drives the timeline.
   * Defaults to `target` itself.
   */
  subject?: Element;
  axis?: ScrollAxis;
  inset?: string | string[];
  /**
   * Start of the animation range within the ViewTimeline.
   * Defaults to `"entry 0%"` (element starts entering the scroll port).
   * Accepts any CSS `<animation-range>` string, e.g. `"cover 0%"`.
   */
  rangeStart?: string;
  /**
   * End of the animation range within the ViewTimeline.
   * Defaults to `"entry 100%"` (element has fully entered the scroll port).
   * Accepts any CSS `<animation-range>` string, e.g. `"cover 100%"`.
   */
  rangeEnd?: string;
};

/** Plays a viewport-driven WAAPI animation on `el` via `ViewTimeline`. */
export function makeViewAnimation(
  el: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
  options?: ViewAnimationOptions,
): Animation {
  const { subject, axis, inset, rangeStart = "entry 0%", rangeEnd = "entry 100%", ...animOptions } = options ?? {};
  return el.animate(keyframes, {
    rangeStart,
    rangeEnd,
    ...animOptions,
    timeline: new ViewTimeline({
      subject: subject ?? el,
      ...(axis !== undefined && { axis }),
      ...(inset !== undefined && { inset }),
    }),
  } as KeyframeAnimationOptions);
}

/**
 * Reactive wrapper around {@link makeViewAnimation}. Re-runs whenever
 * `target`, `keyframes`, or `options` change.
 */
export function createViewAnimation(
  target: Accessor<Element | null | undefined>,
  keyframes: MaybeAccessor<Keyframe[] | PropertyIndexedKeyframes | null>,
  options?: MaybeAccessor<ViewAnimationOptions>,
): Accessor<Animation | undefined> {
  const getKf = asAccessor(keyframes);
  const getOpts = typeof options === "function" ? options : () => options;
  const [animation, setAnimation] = createSignal<Animation | undefined>(undefined, INTERNAL_OPTIONS);

  createEffect(
    () => ({ el: target(), kf: getKf(), opts: getOpts() }),
    ({ el, kf, opts }) => {
      if (!el) {
        setAnimation(undefined);
        return;
      }
      const anim = makeViewAnimation(el, kf, opts);
      setAnimation(anim);
      return () => anim.cancel();
    },
  );

  return animation;
}
