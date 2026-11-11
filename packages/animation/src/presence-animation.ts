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

function reverseKeyframes(
  kf: Keyframe[] | PropertyIndexedKeyframes | null,
): Keyframe[] | PropertyIndexedKeyframes | null {
  if (!kf) return kf;
  if (Array.isArray(kf)) return [...kf].reverse();
  const reversed: PropertyIndexedKeyframes = {};
  for (const key in kf as PropertyIndexedKeyframes) {
    const val = (kf as PropertyIndexedKeyframes)[key];
    (reversed as Record<string, unknown>)[key] = Array.isArray(val) ? [...val].reverse() : val;
  }
  return reversed;
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

  const scheduleEnter = () => {
    const gen = ++enterGen;
    queueMicrotask(() => {
      if (gen !== enterGen) return;
      const el = untrack(target);
      if (!el) return;
      el.animate(options.enter, options.enterOptions);
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
        anim.addEventListener(
          "finish",
          () => {
            done = true;
            setIsMounted(false);
          },
          { once: true },
        );
        return () => {
          if (!done) anim.cancel();
        };
      }
    },
    { defer: true },
  );

  return { isMounted };
}
