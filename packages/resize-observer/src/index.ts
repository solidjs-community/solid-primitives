import {
  createEffect,
  onCleanup,
  on,
  $PROXY,
  $TRACK,
  Accessor,
  onMount,
  sharedConfig,
} from "solid-js";
import {
  asArray,
  Many,
  MaybeAccessor,
  handleDiffArray,
  createHydratableStaticStore,
  createStaticStore,
  access,
} from "@solid-primitives/utils";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { makeEventListener } from "@solid-primitives/event-listener";

export type ResizeHandler = (
  rect: DOMRectReadOnly,
  element: Element,
  entry: ResizeObserverEntry,
) => void;

/**
 * Instantiate a new ResizeObserver that automatically get's disposed on cleanup.
 *
 * @param callback handler called once element size changes
 * @param options ResizeObserver options
 * @returns `observe` and `unobserve` functions
 */
export function makeResizeObserver<T extends Element>(
  callback: ResizeObserverCallback,
  options?: ResizeObserverOptions,
): {
  observe: (ref: T) => void;
  unobserve: (ref: T) => void;
} {
  if (process.env.SSR) {
    return {
      observe: () => {},
      unobserve: () => {},
    };
  }
  const resizeObserver = new ResizeObserver(callback);
  onCleanup(resizeObserver.disconnect.bind(resizeObserver));
  return {
    observe: ref => resizeObserver.observe(ref, options),
    unobserve: resizeObserver.unobserve.bind(resizeObserver),
  };
}

/**
 * Create resize observer instance, listening for changes to size of the reactive {@link targets} array.
 *
 * @param targets Elements to be observed. Can be a reactive signal or store top-level array.
 * @param onResize - Function handler to trigger on element resize
 *
 * @example
 * ```tsx
 * let ref
 * createResizeObserver(() => ref, ({ width, height }, el) => {
 *   if (el === ref) console.log(width, height)
 * });
 * <div ref={ref}/>
 * ```
 */
export function createResizeObserver(
  targets: MaybeAccessor<Many<Element>>,
  onResize: ResizeHandler,
  options?: ResizeObserverOptions,
): void {
  if (process.env.SSR) return;

  const previousMap = new WeakMap<Element, { width: number; height: number }>();
  const { observe, unobserve } = makeResizeObserver(handleObserverCallback, options);

  function handleObserverCallback(entries: ResizeObserverEntry[]) {
    for (const entry of entries) {
      const { contentRect, target } = entry;
      const width = Math.round(contentRect.width);
      const height = Math.round(contentRect.height);
      const previous = previousMap.get(target);
      if (!previous || previous.width !== width || previous.height !== height) {
        onResize(contentRect, entry.target, entry);
        previousMap.set(target, { width, height });
      }
    }
  }

  let refs: Accessor<Element[]> | undefined;
  // is an signal
  if (typeof targets === "function") refs = () => asArray(targets()).slice();
  // is a store array
  else if (Array.isArray(targets) && $PROXY in targets)
    refs = () => {
      // track top-level store array
      (targets as any)[$TRACK];
      return targets.slice();
    };
  // is not reactive
  else {
    asArray(targets).forEach(observe);
    return;
  }

  createEffect(
    on(refs, (current, prev = []) => handleDiffArray(current, prev, observe, unobserve)),
  );
}

const WINDOW_SIZE_FALLBACK = { width: 0, height: 0 } as const;

/**
 * @returns object with width and height dimensions of window, page and screen.
 */
export function getWindowSize(): {
  width: number;
  height: number;
} {
  if (process.env.SSR) return { ...WINDOW_SIZE_FALLBACK };
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Creates a reactive store-like object of current width and height dimensions of window, page and screen.
 * @example
 * const size = createWindowSize();
 * createEffect(() => {
 *   console.log(size.width, size.height)
 * })
 */
export function createWindowSize(): {
  readonly width: number;
  readonly height: number;
} {
  if (process.env.SSR) {
    return WINDOW_SIZE_FALLBACK;
  }
  const [size, setSize] = createHydratableStaticStore(WINDOW_SIZE_FALLBACK, getWindowSize);
  makeEventListener(window, "resize", () => setSize(getWindowSize()));
  return size;
}

/**
 * Returns a reactive store-like object of current width and height dimensions of window, page and screen.
 *
 * This is a [singleton root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) primitive.
 *
 * @example
 * const size = useWindowSize();
 * createEffect(() => {
 *   console.log(size.width, size.height)
 * })
 */
export const useWindowSize: typeof createWindowSize =
  /*#__PURE__*/ createHydratableSingletonRoot(createWindowSize);

const ELEMENT_SIZE_FALLBACK = { width: null, height: null } as const;

/**
 * @param target html element
 * @returns object with width and height dimensions of provided {@link target} element.
 */
export function getElementSize(
  target: Element | false | undefined | null,
): { width: number; height: number } | { width: null; height: null } {
  if (process.env.SSR || !target) {
    return { ...ELEMENT_SIZE_FALLBACK };
  }
  const { width, height } = target.getBoundingClientRect();
  return { width, height };
}

/**
 * Creates a reactive store-like object of current width and height dimensions of {@link target} element.
 * @param target html element to track the size of. Can be a reactive signal.
 * @returns `{ width: number, height: number }`
 * @example
 * const size = createElementSize(document.body);
 * createEffect(() => {
 *   console.log(size.width, size.height)
 * })
 */
export function createElementSize(target: Element): {
  readonly width: number;
  readonly height: number;
};
export function createElementSize(
  target: Accessor<Element | false | undefined | null>,
):
  | { readonly width: number; readonly height: number }
  | { readonly width: null; readonly height: null };
export function createElementSize(target: Accessor<Element | false | undefined | null> | Element): {
  readonly width: number | null;
  readonly height: number | null;
} {
  if (process.env.SSR) {
    return ELEMENT_SIZE_FALLBACK;
  }

  const isFn = typeof target === "function";
  const initWithFallback = isFn || sharedConfig.context;

  const [size, setSize] = createStaticStore(
    initWithFallback ? ELEMENT_SIZE_FALLBACK : getElementSize(target),
  );

  initWithFallback && onMount(() => setSize(getElementSize(access(target))));

  createResizeObserver(isFn ? () => target() || [] : target, e =>
    setSize({ width: e.width, height: e.height }),
  );
  return size;
}
