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
function createPresenceBase(
  /** Indicates whether the component that the resulting values will be used upon should be visible to the user. */
  source: Accessor<boolean>,
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
  const [animateIsVisible, setAnimateIsVisible] = createSignal(initialEnter ? false : source());
  const [isMounted, setIsMounted] = createSignal(source());
  const [hasEntered, setHasEntered] = createSignal(initialEnter ? false : source());

  const isExiting = createMemo(() => isMounted() && !source());
  const isEntering = createMemo(() => source() && !hasEntered());
  const isAnimating = createMemo(() => isEntering() || isExiting());

  createEffect(() => {
    if (source()) {
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
    if (source() && isMounted() && !animateIsVisible()) {
      document.body.offsetHeight; // force reflow
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

const itemShouldBeMounted = <ItemType>(item: ItemType) => item !== false && item != null;

export default function createPresence<ItemType>(
  item: Accessor<ItemType | undefined>,
  opts: Options | Accessor<Options>,
) {
  const [mountedItem, setMountedItem] = createSignal(item());
  const [shouldBeMounted, setShouldBeMounted] = createSignal(itemShouldBeMounted(item()));
  const { isMounted, ...rest } = createPresenceBase(shouldBeMounted, opts);

  createEffect(() => {
    if (mountedItem() !== item()) {
      if (isMounted()) {
        setShouldBeMounted(false);
      } else if (itemShouldBeMounted(item())) {
        setMountedItem(() => item());
        setShouldBeMounted(true);
      }
    } else if (!itemShouldBeMounted(item())) {
      setShouldBeMounted(false);
    } else if (itemShouldBeMounted(item())) {
      setShouldBeMounted(true);
    }
  });

  return {
    ...rest,
    isMounted: () => isMounted() && mountedItem() !== undefined,
    mountedItem,
  };
}
