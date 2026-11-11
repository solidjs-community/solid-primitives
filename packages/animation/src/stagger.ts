import { createSignal, createEffect, type Accessor } from "solid-js";
import { type MaybeAccessor, asAccessor, INTERNAL_OPTIONS } from "@solid-primitives/utils";

export type StaggerOptions = KeyframeAnimationOptions & {
  /** Additional delay in milliseconds between each element, stacked on top of `delay`. */
  stagger?: number;
};

/** Plays a staggered WAAPI animation across `els`, returning all `Animation` instances. */
export function makeStagger(
  els: Element[],
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
  options?: StaggerOptions,
): Animation[] {
  const { stagger = 0, ...animOptions } = options ?? {};
  const baseDelay = typeof animOptions.delay === "number" ? animOptions.delay : 0;
  return els.map((el, i) => el.animate(keyframes, { ...animOptions, delay: baseDelay + i * stagger }));
}

/**
 * Reactive wrapper around {@link makeStagger}. Re-runs (cancelling previous
 * animations) whenever `targets`, `keyframes`, or `options` change reactively.
 */
export function createStagger(
  targets: Accessor<(Element | null | undefined)[]>,
  keyframes: MaybeAccessor<Keyframe[] | PropertyIndexedKeyframes | null>,
  options?: MaybeAccessor<StaggerOptions>,
): Accessor<Animation[]> {
  const getKf = asAccessor(keyframes);
  const getOpts = typeof options === "function" ? options : () => options;
  const [animations, setAnimations] = createSignal<Animation[]>([], INTERNAL_OPTIONS);

  createEffect(
    () => ({ els: targets(), kf: getKf(), opts: getOpts() }),
    ({ els, kf, opts }) => {
      const anims = makeStagger(els.filter((el): el is Element => el != null), kf, opts);
      setAnimations(anims);
      return () => anims.forEach(a => a.cancel());
    },
  );

  return animations;
}
