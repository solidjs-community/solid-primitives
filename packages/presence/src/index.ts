/*

MIT License (MIT)
Inspired by & directly forked from use-presence by Jan Amann @amannn
See https://github.com/amannn/react-hooks/tree/main/packages/use-presence

*/

import {
  createSignal,
  createEffect,
  onCleanup,
  type Accessor,
  createMemo,
  untrack,
} from "solid-js";
import { MaybeAccessor, asAccessor } from "@solid-primitives/utils";

export type SharedTransitionConfig = {
  /** Duration in milliseconds used both for enter and exit transitions. */
  transitionDuration: MaybeAccessor<number>;
};

export type SeparateTransitionConfig = {
  /** Duration in milliseconds used for enter transitions (overrides `transitionDuration` if provided). */
  enterDuration: MaybeAccessor<number>;
  /** Duration in milliseconds used for exit transitions (overrides `transitionDuration` if provided). */
  exitDuration: MaybeAccessor<number>;
};

export type Options = (
  | SharedTransitionConfig
  | SeparateTransitionConfig
  | (SharedTransitionConfig & SeparateTransitionConfig)
) & {
  /** Opt-in to animating the entering of an element if `isVisible` is `true` during the initial mount. */
  initialEnter?: boolean;
};

/**
 * Animates the appearance of its children.
 *
 * @internal - to be combined with `createPresence` in the future
 */
function createPresenceBase(
  /** Indicates whether the component that the resulting values will be used upon should be visible to the user. */
  source: Accessor<boolean>,
  options: Options,
) {
  const exitDuration = asAccessor(
    "exitDuration" in options ? options.exitDuration : options.transitionDuration,
  );
  const enterDuration = asAccessor(
    "enterDuration" in options ? options.enterDuration : options.transitionDuration,
  );

  const initialSource = untrack(source);
  const initialState = options.initialEnter ? false : initialSource;
  const [isVisible, setIsVisible] = createSignal(initialState);
  const [isMounted, setIsMounted] = createSignal(initialSource);
  const [hasEntered, setHasEntered] = createSignal(initialState);

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
      setIsVisible(false);

      const timeoutId = setTimeout(() => {
        setIsMounted(false);
      }, exitDuration());

      onCleanup(() => clearTimeout(timeoutId));
    }
  });

  createEffect(() => {
    if (source() && isMounted() && !isVisible()) {
      document.body.offsetHeight; // force reflow

      const animationFrameId = requestAnimationFrame(() => {
        setIsVisible(true);
      });

      onCleanup(() => cancelAnimationFrame(animationFrameId));
    }
  });

  createEffect(() => {
    if (isVisible() && !hasEntered()) {
      const timeoutId = setTimeout(() => {
        setHasEntered(true);
      }, enterDuration());

      onCleanup(() => clearTimeout(timeoutId));
    }
  });

  return {
    isMounted,
    isVisible,
    isAnimating,
    isEntering,
    isExiting,
  };
}

const itemShouldBeMounted = <TItem>(item: TItem) => item !== false && item != null;

/**
 * The result of {@link createPresence}.
 */
export type PresenceResult<TItem> = {
  /** Should the component be returned from render? */
  isMounted: Accessor<boolean>;
  /** The item that is currently mounted. */
  mountedItem: Accessor<TItem | undefined>;
  /** Should the component have its visible styles applied? */
  isVisible: Accessor<boolean>;
  /** Is the component either entering or exiting currently? */
  isAnimating: Accessor<boolean>;
  /** Is the component entering currently? */
  isEntering: Accessor<boolean>;
  /** Is the component exiting currently? */
  isExiting: Accessor<boolean>;
};

/**
 * Utility to animate the presence of an element based on the existence of data or lack thereof.
 *
 * @param item a reactive value driving the transition
 * @param options options to configure the transition, see {@link Options}
 * @returns an object with reactive accessors representing the state of the transition. See {@link PresenceResult}.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/presence#createPresence
 *
 * @example
 * ```ts
 * const items = ["foo", "bar", "baz", "qux"];
 * const [activeItem, setActiveItem] = createSignal(items[0]);
 * const presence = createPresence(activeItem);
 * ```
 */
export function createPresence<TItem>(
  item: Accessor<TItem | undefined>,
  options: Options,
): PresenceResult<TItem> {
  const initial = untrack(item);
  const [mountedItem, setMountedItem] = createSignal(initial);
  const [shouldBeMounted, setShouldBeMounted] = createSignal(itemShouldBeMounted(initial));
  const { isMounted, ...rest } = createPresenceBase(shouldBeMounted, options);

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
