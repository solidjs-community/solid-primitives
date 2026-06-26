import { createSignal, createEffect, type Accessor } from "solid-js";
import { type MaybeAccessor, asAccessor, INTERNAL_OPTIONS } from "@solid-primitives/utils";

/** Plays a WAAPI animation on `el` and returns the `Animation` instance. */
export function makeAnimate(
  el: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
  options?: KeyframeAnimationOptions,
): Animation {
  return el.animate(keyframes, options);
}

/**
 * Reactive wrapper around {@link makeAnimate}. Re-runs (cancelling the prior
 * animation) whenever `target`, `keyframes`, or `options` change. Cancels
 * automatically when the owner scope is disposed.
 */
export function createAnimate(
  target: Accessor<Element | null | undefined>,
  keyframes: MaybeAccessor<Keyframe[] | PropertyIndexedKeyframes | null>,
  options?: MaybeAccessor<KeyframeAnimationOptions>,
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
      const anim = makeAnimate(el, kf, opts);
      setAnimation(anim);
      return () => anim.cancel();
    },
  );

  return animation;
}
