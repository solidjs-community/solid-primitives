import { createSignal, createEffect, onCleanup, type Accessor, createMemo } from "solid-js";

type SharedTransitionConfig = {
  /** Duration in milliseconds used both for enter and exit transitions. */
  transitionDuration: number;
};

type SeparateTransitionConfig = {
  /** Duration in milliseconds used for enter transitions (overrides `transitionDuration` if provided). */
  enterDuration: number;
  /** Duration in milliseconds used for exit transitions (overrides `transitionDuration` if provided). */
  exitDuration: number;
};

type Options = (
  | SharedTransitionConfig
  | SeparateTransitionConfig
  | (SharedTransitionConfig & SeparateTransitionConfig)
) & {
  /** Opt-in to animating the entering of an element if `isVisible` is `true` during the initial mount. */
  initialEnter?: boolean;
};

/**
 * Animates the appearance of its children.
 */
export default function createPresence(
  /** Indicates whether the component that the resulting values will be used upon should be visible to the user. */
  isVisible: Accessor<boolean>,
  optsValue: Options | Accessor<Options>,
) {
  const opts = () => (typeof optsValue === "function" ? optsValue() : optsValue);
  const exitDuration = createMemo(() => {
    const optsValue = opts();
    return "exitDuration" in optsValue ? optsValue.exitDuration : optsValue.transitionDuration;
  });
  const enterDuration = createMemo(() => {
    const optsValue = opts();
    return "enterDuration" in optsValue ? optsValue.enterDuration : optsValue.transitionDuration;
  });

  const initialEnter = opts().initialEnter ?? false;
  const [animateIsVisible, setAnimateIsVisible] = createSignal(initialEnter ? false : isVisible());
  const [isMounted, setIsMounted] = createSignal(isVisible());
  const [hasEntered, setHasEntered] = createSignal(initialEnter ? false : isVisible());

  const isExiting = createMemo(() => isMounted() && !isVisible());
  const isEntering = createMemo(() => isVisible() && !hasEntered());
  const isAnimating = createMemo(() => isEntering() || isExiting());

  createEffect(() => {
    if (isVisible()) {
      // `animateVisible` needs to be set to `true` in a second step, as
      // when both flags would be flipped at the same time, there would
      // be no transition. See the second effect below.
      setIsMounted(true);
    } else {
      setHasEntered(false);
      setAnimateIsVisible(false);

      const timeoutId = setTimeout(() => {
        setIsMounted(false);
      }, exitDuration());

      onCleanup(() => clearTimeout(timeoutId));
    }
  });

  createEffect(() => {
    if (isVisible() && isMounted() && !animateIsVisible()) {
      // Force a reflow so the initial styles are flushed to the DOM
      if (typeof document !== undefined) {
        // We need a side effect so Terser doesn't remove this statement
        (window as any)._usePresenceReflow = document.body.offsetHeight;
      }

      const animationFrameId = requestAnimationFrame(() => {
        setAnimateIsVisible(true);
      });

      onCleanup(() => cancelAnimationFrame(animationFrameId));
    }
  });

  createEffect(() => {
    if (animateIsVisible() && !hasEntered()) {
      const timeoutId = setTimeout(() => {
        setHasEntered(true);
      }, enterDuration());

      onCleanup(() => clearTimeout(timeoutId));
    }
  });

  return {
    isMounted,
    isVisible: animateIsVisible,
    isAnimating,
    isEntering,
    isExiting,
  };
}
