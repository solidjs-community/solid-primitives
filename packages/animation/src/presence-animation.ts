import {
  createSignal,
  createEffect,
  createRenderEffect,
  createMemo,
  untrack,
  type Accessor,
} from "solid-js";
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
    (shouldShow) => {
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
        anim.addEventListener("finish", () => { done = true; setIsMounted(false); }, { once: true });
        return () => {
          if (!done) anim.cancel();
        };
      }
    },
    { defer: true },
  );

  return { isMounted };
}

// ─── createPresenceA ─────────────────────────────────────────────────────────

/**
 * `createPresenceA` — deferred-`isMounted` approach.
 *
 * The component's reactive scope stays alive during the exit animation because
 * `isMounted` only goes `false` after the WAAPI `.finish` event fires. Gate
 * `<Show>` on `isMounted()`, not on the raw `show` value.
 *
 * Uses `createRenderEffect` so animation setup runs in the render phase —
 * before user effects in the same flush — keeping it tight with DOM updates.
 *
 * @example
 * ```tsx
 * const { isMounted, isExiting } = createPresenceA(() => el, show, {
 *   enter: [{ opacity: 0 }, { opacity: 1 }],
 *   enterOptions: { duration: 250 },
 *   exitOptions:  { duration: 180 },
 * });
 *
 * return (
 *   <Show when={isMounted()}>
 *     <div ref={el} class={isExiting() ? "fade-out" : "fade-in"}>
 *       <Counter />  // signals stay alive during exit
 *     </div>
 *   </Show>
 * );
 * ```
 */
export function createPresenceA(
  target: Accessor<HTMLElement | null | undefined>,
  show: MaybeAccessor<boolean>,
  options: PresenceAnimationOptions,
): { isMounted: Accessor<boolean>; isExiting: Accessor<boolean> } {
  const getShow = asAccessor(show);
  const [isMounted, setIsMounted] = createSignal(untrack(getShow), INTERNAL_OPTIONS);
  const [isExiting, setIsExiting] = createSignal(false, INTERNAL_OPTIONS);

  let enterGen = 0;

  if (options.initialEnter && untrack(getShow)) {
    const gen = ++enterGen;
    queueMicrotask(() => {
      if (gen !== enterGen) return;
      const el = untrack(target);
      if (!el) return;
      el.animate(options.enter, options.enterOptions);
    });
  }

  // createRenderEffect runs its apply in the render phase, before user effects,
  // so animation setup is tightly coupled to the DOM-update cycle.
  // The `prev === undefined` guard skips the initial synchronous apply.
  createRenderEffect(
    () => getShow(),
    (shouldShow, prev) => {
      if (prev === undefined) return; // skip initial mount
      if (shouldShow) {
        setIsMounted(true);
        setIsExiting(false);
        const gen = ++enterGen;
        queueMicrotask(() => {
          if (gen !== enterGen) return;
          const el = untrack(target);
          if (!el) return;
          el.animate(options.enter, options.enterOptions);
        });
      } else {
        enterGen++;
        setIsExiting(true);
        const el = untrack(target);
        if (!el) {
          setIsExiting(false);
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
            setIsExiting(false);
            setIsMounted(false);
          },
          { once: true },
        );
        return () => {
          if (!done) {
            anim.cancel();
            setIsExiting(false);
          }
        };
      }
    },
  );

  return { isMounted, isExiting };
}

// ─── createPresenceB ─────────────────────────────────────────────────────────

/**
 * `createPresenceB` — Solid 2.0 deferred-disposal approach via async signal.
 *
 * The component's reactive scope stays alive during the exit animation through
 * Solid 2.0's built-in pending-signal mechanism:
 *
 * 1. `gate` is a **non-sync `createMemo`** (no `sync: true`).
 *    When exiting, it returns a `Promise<void>` instead of `false`.
 * 2. Returning a Promise causes `handleAsync` to throw `NotReadyError`,
 *    which puts `gate` into `STATUS_PENDING`.
 * 3. `notifyStatus(STATUS_PENDING)` propagates to `gate`'s subscribers via
 *    `queuePendingNode` — **not** `insertSubs` / dirty-heap marking.
 * 4. Show's internal `createRenderEffect` ends up in `_pendingNodes` only.
 *    It is never recomputed, so `_pendingFirstChild` is never set.
 * 5. `commitPendingNode` finds no zombie children → the component owner is
 *    **not disposed** — all signals and event handlers stay alive. ✓
 * 6. When the WAAPI animation finishes, the Promise resolves. `asyncWrite`
 *    sets `gate._value = undefined` and calls `insertSubs`, which makes Show
 *    recompute and finally remove the component.
 *
 * Use `gate()` (not the raw `show` value) as the `<Show when={...}>` gate.
 * `createRenderEffect` is used for the enter animation so it runs in the
 * render phase — the same phase Show uses — before any user effects.
 *
 * @example
 * ```tsx
 * const { gate, isExiting } = createPresenceB(() => el, show, {
 *   enter: [{ opacity: 0 }, { opacity: 1 }],
 *   exitOptions: { duration: 1500 },
 * });
 *
 * return (
 *   <Show when={gate()}>
 *     <div ref={el} class={isExiting() ? "out" : "in"}>
 *       <Counter />  // signals alive — disposed only after animation resolves
 *     </div>
 *   </Show>
 * );
 * ```
 */
export function createPresenceB(
  target: Accessor<HTMLElement | null | undefined>,
  show: MaybeAccessor<boolean>,
  options: PresenceAnimationOptions,
): { gate: Accessor<boolean>; isExiting: Accessor<boolean> } {
  const getShow = asAccessor(show);
  const [isExiting, setIsExiting] = createSignal(false, INTERNAL_OPTIONS);

  let exitAnim: Animation | undefined;
  let animPromise: Promise<void> | undefined;
  let enterGen = 0;
  // Track whether this instance has ever been shown. Before the first mount,
  // the gate should return plain `false` rather than a Promise — returning a
  // Promise on a never-mounted slide would trigger handleAsync/initTransition
  // during the initial render and can prevent other slides from appearing.
  let hasBeenShown = untrack(getShow);

  // Non-sync memo (no `sync: true`) — can return a Promise, making it
  // STATUS_PENDING via handleAsync. When pending, notifyStatus propagates to
  // Show's internal createRenderEffect via queuePendingNode (not insertSubs),
  // so that render effect is never recomputed and its component owner is
  // never touched. See JSDoc above for the full step-by-step.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gate = createMemo((): any => {
    const shouldShow = !!getShow();

    if (shouldShow) {
      hasBeenShown = true;
      if (exitAnim) {
        exitAnim.cancel();
        exitAnim = undefined;
        animPromise = undefined;
      }
      return true;
    }

    // If this instance was never mounted, just return false — no exit
    // animation is needed and no Promise should be created.
    if (!hasBeenShown) return false;

    // Create the exit Promise once. Returning the same Promise object on
    // subsequent recomputes is safe: handleAsync guards stale asyncWrite
    // callbacks via `el._inFlight !== result`.
    if (!animPromise) {
      animPromise = new Promise<void>(resolve => {
        queueMicrotask(() => {
          const el = untrack(target);
          if (!el) {
            animPromise = undefined;
            setIsExiting(false);
            resolve();
            return;
          }
          setIsExiting(true);
          const exitKf = options.exit ?? reverseKeyframes(options.enter);
          exitAnim = el.animate(exitKf, options.exitOptions ?? options.enterOptions);
          exitAnim.addEventListener(
            "finish",
            () => {
              exitAnim = undefined;
              animPromise = undefined;
              setIsExiting(false);
              resolve(); // → asyncWrite → gate._value = undefined → Show removes component
            },
            { once: true },
          );
        });
      });
    }

    return animPromise;
  }) as unknown as Accessor<boolean>;

  // Read gate() — the async signal — inside a createRenderEffect.
  // When gate is STATUS_PENDING (exit animation running), this render effect
  // is also placed into _pendingNodes via queuePendingNode (apply does not
  // run while pending). When gate resolves to true (show becomes true),
  // apply fires and starts the enter animation.
  createRenderEffect(
    () => gate(),
    (gateValue: unknown, prev: unknown) => {
      if (prev === undefined) return; // skip initial mount
      if (gateValue !== true) return; // pending or false — exit handled by gate memo
      setIsExiting(false);
      const gen = ++enterGen;
      queueMicrotask(() => {
        if (gen !== enterGen) return;
        const el = untrack(target);
        if (!el) return;
        el.animate(options.enter, options.enterOptions);
      });
    },
  );

  if (options.initialEnter && untrack(getShow)) {
    const gen = ++enterGen;
    queueMicrotask(() => {
      if (gen !== enterGen) return;
      const el = untrack(target);
      if (!el) return;
      el.animate(options.enter, options.enterOptions);
    });
  }

  return { gate, isExiting };
}
