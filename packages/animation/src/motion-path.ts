import { createSignal, createEffect, type Accessor } from "solid-js";
import { type MaybeAccessor, asAccessor, INTERNAL_OPTIONS } from "@solid-primitives/utils";

export type MotionPathOptions = KeyframeAnimationOptions & {
  /**
   * CSS `offset-rotate` value controlling element orientation along the path.
   * Pass `"auto"` to rotate with the path tangent, `"0deg"` to keep the
   * element's original orientation, or any CSS angle / `"reverse"`.
   * Default: `"auto"`.
   */
  rotate?: string;
};

/**
 * Animates `el` along a CSS Motion Path using WAAPI. Sets `offset-path` and
 * `offset-rotate` on the element as a side effect; these are left in place
 * after the animation so `fill: "forwards"` works correctly.
 *
 * @param path  SVG path string passed to `path("…")`, or any valid
 *              `offset-path` value (e.g. `"circle(50%)"`, `"ray(45deg)"`)
 */
export function makeMotionPath(
  el: HTMLElement,
  path: string,
  options?: MotionPathOptions,
): Animation {
  const { rotate = "auto", ...animOptions } = options ?? {};
  el.style.offsetPath = path.includes("(") ? path : `path("${path}")`;
  el.style.offsetRotate = rotate;
  el.style.offsetAnchor = "center";
  return el.animate(
    [{ offsetDistance: "0%" }, { offsetDistance: "100%" }],
    animOptions,
  );
}

/**
 * Reactive wrapper around {@link makeMotionPath}. Re-runs whenever
 * `target`, `path`, or `options` change.
 */
export function createMotionPath(
  target: Accessor<HTMLElement | null | undefined>,
  path: MaybeAccessor<string>,
  options?: MaybeAccessor<MotionPathOptions>,
): Accessor<Animation | undefined> {
  const getPath = asAccessor(path);
  const getOpts = typeof options === "function" ? options : () => options;
  const [animation, setAnimation] = createSignal<Animation | undefined>(undefined, INTERNAL_OPTIONS);

  createEffect(
    () => ({ el: target(), path: getPath(), opts: getOpts() }),
    ({ el, path, opts }) => {
      if (!el) { setAnimation(undefined); return; }
      const anim = makeMotionPath(el, path, opts);
      setAnimation(anim);
      return () => anim.cancel();
    },
  );

  return animation;
}
