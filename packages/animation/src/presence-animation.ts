import { createSignal, createEffect, untrack, type Accessor } from "solid-js";
import { type MaybeAccessor, asAccessor, INTERNAL_OPTIONS } from "@solid-primitives/utils";

export type PresenceAnimationOptions = {
  /** Keyframes played when the element enters. */
  enter: Keyframe[] | PropertyIndexedKeyframes | null;
  /**
   * Keyframes played when the element exits.
   * Defaults to the enter keyframes in reverse.
   */
  exit?: Keyframe[] | PropertyIndexedKeyframes | null;
  /** WAAPI options for the enter animation. */
  enterOptions?: KeyframeAnimationOptions;
  /**
   * WAAPI options for the exit animation.
   * Defaults to `enterOptions`.
   */
  exitOptions?: KeyframeAnimationOptions;
  /**
   * Play the enter animation on the initial mount when `show` is already
   * `true`. Defaults to `false`.
   */
  initialEnter?: boolean;
};

const mirrorOffset = (o: unknown) => (typeof o === "number" ? 1 - o : o);

/**
 * Reverses keyframes for the default exit animation. Offsets are mirrored
 * (`1 - offset`) so they stay non-decreasing, and per-keyframe easings are
 * shifted so each segment keeps its own easing.
 */
function reverseKeyframes(
  kf: Keyframe[] | PropertyIndexedKeyframes | null,
): Keyframe[] | PropertyIndexedKeyframes | null {
  if (!kf) return kf;
  if (Array.isArray(kf)) {
    const n = kf.length;
    return [...kf].reverse().map((frame, j) => {
      const out: Keyframe = { ...frame };
      if (out.offset != null) out.offset = 1 - out.offset;
      // Easing of original frame i drives segment i → i+1; reversed, that is (n-2-j) → (n-1-j).
      const easing = j < n - 1 ? kf[n - 2 - j]!.easing : undefined;
      if (easing !== undefined) out.easing = easing;
      else delete out.easing;
      return out;
    });
  }
  const src = kf as Record<string, unknown>;
  const count = Math.max(
    0,
    ...Object.entries(src).map(([k, v]) =>
      k !== "offset" && k !== "easing" && Array.isArray(v) ? v.length : 0,
    ),
  );
  const reversed: Record<string, unknown> = {};
  for (const key in src) {
    const val = src[key];
    if (key === "offset") {
      reversed[key] = Array.isArray(val) ? [...val].reverse().map(mirrorOffset) : val;
    } else if (key === "easing" && Array.isArray(val) && count > 1) {
      const eased: unknown[] = [];
      for (let j = 0; j < count - 1; j++) eased.push(val[(count - 2 - j) % val.length]);
      reversed[key] = eased;
    } else {
      reversed[key] = Array.isArray(val) ? [...val].reverse() : val;
    }
  }
  return reversed as PropertyIndexedKeyframes;
}

// ─── createPresenceAnimation ─────────────────────────────────────────────────

/**
 * Manages mount/unmount lifecycle with WAAPI enter and exit animations.
 *
 * `isMounted` should gate the element's presence in the DOM (e.g. as the
 * `when` prop of `<Show>`). The enter animation plays after the element
 * mounts; the exit animation plays on the element before it is removed, and
 * the element stays in the DOM until that animation completes.
 *
 * If `show` toggles back to `true` while an exit animation is in progress,
 * the exit is cancelled and the enter animation restarts.
 *
 * @example
 * ```tsx
 * const [show, setShow] = createSignal(false);
 * let el!: HTMLDivElement;
 *
 * const { isMounted } = createPresenceAnimation(() => el, show, {
 *   enter: [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
 *   enterOptions: { duration: 250, easing: "ease-out", fill: "both" },
 *   exitOptions:  { duration: 180, easing: "ease-in",  fill: "forwards" },
 * });
 *
 * return (
 *   <>
 *     <button onClick={() => setShow(v => !v)}>Toggle</button>
 *     <Show when={isMounted()}>
 *       <div ref={el}>Hello</div>
 *     </Show>
 *   </>
 * );
 * ```
 */
export function createPresenceAnimation(
  target: Accessor<HTMLElement | null | undefined>,
  show: MaybeAccessor<boolean>,
  options: PresenceAnimationOptions,
): { isMounted: Accessor<boolean> } {
  const getShow = asAccessor(show);
  const [isMounted, setIsMounted] = createSignal(untrack(getShow), INTERNAL_OPTIONS);

  let enterGen = 0;
  let enterAnim: Animation | undefined;

  const scheduleEnter = () => {
    const gen = ++enterGen;
    queueMicrotask(() => {
      if (gen !== enterGen) return;
      const el = untrack(target);
      if (!el) return;
      // Drop the previous enter so finished `fill` animations don't stack on a reused element.
      enterAnim?.cancel();
      enterAnim = el.animate(options.enter, options.enterOptions);
    });
  };

  if (options.initialEnter && untrack(getShow)) {
    scheduleEnter();
  }

  createEffect(
    () => getShow(),
    shouldShow => {
      if (shouldShow) {
        setIsMounted(true);
        scheduleEnter();
      } else {
        enterGen++;
        const el = untrack(target);
        if (!el) {
          setIsMounted(false);
          return;
        }
        const exitKf = options.exit ?? reverseKeyframes(options.enter);
        const anim = el.animate(exitKf, options.exitOptions ?? options.enterOptions);
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          setIsMounted(false);
        };
        // An externally cancelled exit (e.g. `display: none`) would otherwise never unmount.
        anim.addEventListener("finish", finish, { once: true });
        anim.addEventListener("cancel", finish, { once: true });
        return () => {
          // Mark done first so our own cancel() doesn't unmount (show toggled back / disposed).
          if (done) return;
          done = true;
          anim.cancel();
        };
      }
    },
    { defer: true },
  );

  return { isMounted };
}
