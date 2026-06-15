import { createEffect, createSignal, onCleanup, type Accessor } from "solid-js";
import { isServer } from "@solidjs/web";
import { makeEventListener } from "@solid-primitives/event-listener";
import { access, INTERNAL_OPTIONS } from "@solid-primitives/utils";

/**
 * Non-reactive fullscreen helper. No Solid lifecycle dependency.
 *
 * @param element The element to make fullscreen.
 * @param options Standard `FullscreenOptions`.
 * @returns `[enter, exit]` — `enter()` requests fullscreen, `exit()` leaves it.
 *   Options passed to `enter()` override the creation-time options.
 *
 * @example
 * ```ts
 * const [enter, exit] = makeFullscreen(ref);
 * button.addEventListener("click", enter);
 * ```
 */
export const makeFullscreen = (
  element: HTMLElement,
  options?: FullscreenOptions,
): [enter: (options?: FullscreenOptions) => Promise<void>, exit: () => Promise<void>] => {
  const enter = (callOptions?: FullscreenOptions) =>
    element.requestFullscreen(callOptions ?? options);
  const exit = () => document.exitFullscreen();
  return [enter, exit];
};

export interface FullscreenPrimitiveOptions extends FullscreenOptions {
  /** Exit fullscreen when the reactive scope is disposed. Default: `true`. */
  exitOnCleanup?: boolean;
}

/**
 * Reactive fullscreen primitive. Call `enter()` and `exit()` imperatively
 * from user gesture handlers — the browser requires a direct user interaction
 * to allow fullscreen. `isActive` tracks the real fullscreen state via the
 * `fullscreenchange` event and initializes to `true` if the element is already
 * fullscreen when the primitive is created.
 *
 * @param ref The element to fullscreen, or a reactive accessor returning one.
 * @param options Extends `FullscreenOptions` with `exitOnCleanup` (default `true`).
 * @returns `{ enter, exit, isActive }`
 *
 * @example
 * ```tsx
 * const { enter, exit, isActive } = createFullscreen(ref);
 *
 * <button onClick={enter}>Go fullscreen</button>
 * <Show when={isActive()}>
 *   <button onClick={exit}>Exit</button>
 * </Show>
 * ```
 */
export const createFullscreen = (
  ref: HTMLElement | Accessor<HTMLElement | undefined>,
  options?: FullscreenPrimitiveOptions,
): {
  enter: (options?: FullscreenOptions) => Promise<void>;
  exit: () => Promise<void>;
  isActive: Accessor<boolean>;
} => {
  if (isServer) {
    return {
      enter: () => Promise.resolve(),
      exit: () => Promise.resolve(),
      isActive: () => false,
    };
  }

  const { exitOnCleanup = true, ...nativeOptions } = options ?? {};
  const initial = access(ref);

  let bound: ReturnType<typeof makeFullscreen> | null = initial
    ? makeFullscreen(initial, nativeOptions)
    : null;

  const [isActive, setActive] = createSignal(
    document.fullscreenElement != null && document.fullscreenElement === initial,
    INTERNAL_OPTIONS,
  );

  // makeEventListener registers onCleanup automatically; reads access(ref) dynamically
  // so no rebinding is needed when the element changes
  makeEventListener(document, "fullscreenchange", () =>
    setActive(document.fullscreenElement === access(ref)),
  );

  if (typeof ref === "function") {
    createEffect(
      () => ref(),
      node => {
        bound = node ? makeFullscreen(node, nativeOptions) : null;
        setActive(document.fullscreenElement === node);
      },
    );
  }

  onCleanup(() => {
    if (exitOnCleanup && isActive()) document.exitFullscreen();
  });

  return {
    enter: (callOptions?: FullscreenOptions): Promise<void> =>
      bound?.[0](callOptions) ?? Promise.resolve(),
    exit: (): Promise<void> => bound?.[1]() ?? Promise.resolve(),
    isActive,
  };
};

/**
 * Ref directive that toggles fullscreen when the element is clicked.
 * Attach to any element — clicking it enters fullscreen; clicking again exits.
 *
 * @example
 * ```tsx
 * <div ref={fullscreen()}>Click to go fullscreen</div>
 * <div ref={fullscreen({ navigationUI: "hide" })}>Click to go fullscreen</div>
 * ```
 */
export const fullscreen = (options?: FullscreenOptions): ((el: HTMLElement) => void) => {
  if (isServer) return () => {};

  let removeListener: (() => void) | undefined;
  onCleanup(() => removeListener?.());

  return (el: HTMLElement) => {
    removeListener?.();
    const [enter, exit] = makeFullscreen(el, options);
    const toggle = () => (document.fullscreenElement === el ? exit() : enter());
    el.addEventListener("click", toggle);
    removeListener = () => el.removeEventListener("click", toggle);
  };
};
