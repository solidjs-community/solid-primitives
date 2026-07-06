import { makeEventListener } from "@solid-primitives/event-listener";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { createHydratableStaticStore, createStaticStore } from "@solid-primitives/static-store";
import {
  access,
  asArray,
  handleDiffArray,
  type Many,
  type MaybeAccessor,
  noop,
  filterNonNullable,
} from "@solid-primitives/utils";
import { type Accessor, createEffect, onCleanup, sharedConfig } from "solid-js";
import { isServer } from "solid-js/web";

type ResizeObserverEntryGeneric<T extends Element> = ResizeObserverEntry & { readonly target: T };
type ResizeObserverCallbackGeneric<T extends Element> = (
  entries: ResizeObserverEntryGeneric<T>[],
  observer: ResizeObserver,
) => void;
export type ResizeHandler<T extends Element = Element> = (
  rect: DOMRectReadOnly,
  element: T,
  entry: ResizeObserverEntryGeneric<T>,
) => void;

export type Size = { width: number; height: number };
type SizeWithClient = Size & { clientWidth: number; clientHeight: number };
export type NullableSize =
  | SizeWithClient
  | { width: null; height: null; clientWidth: null; clientHeight: null };

/**
 * Instantiate a new ResizeObserver that automatically get's disposed on cleanup.
 *
 * @param callback handler called once element size changes
 * @param options ResizeObserver options
 * @returns `observe` and `unobserve` functions
 */
export function makeResizeObserver<T extends Element>(
  callback: ResizeObserverCallbackGeneric<T>,
  options?: ResizeObserverOptions,
): {
  observe: (ref: T) => void;
  unobserve: (ref: T) => void;
} {
  if (isServer) {
    return { observe: noop, unobserve: noop };
  }
  const observer = new ResizeObserver(callback as ResizeObserverCallback);
  onCleanup(observer.disconnect.bind(observer));
  return {
    observe: ref => observer.observe(ref, options),
    unobserve: observer.unobserve.bind(observer),
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
export function createResizeObserver<T extends Element>(
  targets: MaybeAccessor<Many<T | undefined | null>>,
  onResize: ResizeHandler<T>,
  options?: ResizeObserverOptions,
): void {
  if (isServer) return;

  const previousMap = new WeakMap<T, Size>(),
    { observe, unobserve } = makeResizeObserver<T>(entries => {
      for (const entry of entries) {
        const { contentRect, target } = entry,
          width = Math.round(contentRect.width),
          height = Math.round(contentRect.height),
          previous = previousMap.get(target);
        if (!previous || previous.width !== width || previous.height !== height) {
          onResize(contentRect, target, entry);
          previousMap.set(target, { width, height });
        }
      }
    }, options);

  createEffect((prev: T[]) => {
    const refs = filterNonNullable(asArray(access(targets)));
    handleDiffArray(refs, prev, observe, unobserve);
    return refs;
  }, []);
}

const WINDOW_SIZE_FALLBACK = { width: 0, height: 0 } as const satisfies Size;

/**
 * @returns object with width and height dimensions of window, page and screen.
 */
export function getWindowSize(): Size {
  if (isServer) return { ...WINDOW_SIZE_FALLBACK };
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
export function createWindowSize(): Readonly<Size> {
  if (isServer) {
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

const ELEMENT_SIZE_FALLBACK = {
  width: null,
  height: null,
  clientWidth: null,
  clientHeight: null,
} as const satisfies NullableSize;

/**
 * @param target html element
 * @returns object with width and height dimensions of provided {@link target} element.
 */
export function getElementSize(target: Element | false | undefined | null): NullableSize {
  if (isServer || !target) {
    return { ...ELEMENT_SIZE_FALLBACK };
  }
  const { width, height } = target.getBoundingClientRect();
  const { clientWidth, clientHeight } = target;
  return { width, height, clientWidth, clientHeight };
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
export function createElementSize(target: Element): SizeWithClient;
export function createElementSize(
  target: Accessor<Element | false | undefined | null>,
): Readonly<NullableSize>;
export function createElementSize(
  target: Accessor<Element | false | undefined | null> | Element,
): Readonly<NullableSize> {
  if (isServer) {
    return ELEMENT_SIZE_FALLBACK;
  }

  const isFn = typeof target === "function";

  const [size, setSize] = createStaticStore(
    sharedConfig.context || isFn ? ELEMENT_SIZE_FALLBACK : getElementSize(target),
  );

  const ro = new ResizeObserver(([e]) => setSize(getElementSize(e!.target)));
  onCleanup(() => ro.disconnect());

  if (isFn) {
    createEffect(() => {
      const el = target();
      if (el) {
        setSize(getElementSize(el));
        ro.observe(el);
        onCleanup(() => ro.unobserve(el));
      }
    });
  } else {
    ro.observe(target);
    onCleanup(() => ro.unobserve(target));
  }

  return size;
}
