import { makeEventListener } from "@solid-primitives/event-listener";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { createStaticStore } from "@solid-primitives/static-store";
import {
  access,
  asArray,
  handleDiffArray,
  type Many,
  type MaybeAccessor,
  noop,
  filterNonNullable,
} from "@solid-primitives/utils";
import { type Accessor, createEffect, onSettled, onCleanup } from "solid-js";
import { sharedConfig } from "solid-js/internal";
import { isServer } from "@solidjs/web";

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

export type SizeWithClient = Size & { clientWidth: number; clientHeight: number };
export type NullableSize =
  SizeWithClient | { width: null; height: null; clientWidth: null; clientHeight: null };

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

  let prev: T[] = [];
  createEffect(
    () => filterNonNullable(asArray(access(targets))),
    (refs: T[]) => {
      handleDiffArray(refs, prev, observe, unobserve);
      prev = refs;
    },
    { transparent: true },
  );
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
 * createEffect(
 *   () => [size.width, size.height],
 *   ([width, height]) => console.log(width, height),
 * );
 */
export function createWindowSize(): Readonly<Size> {
  const [size, setSize] = createStaticStore(
    isServer || sharedConfig.hydrating ? WINDOW_SIZE_FALLBACK : getWindowSize(),
  );
  if (isServer || sharedConfig.hydrating)
    onSettled(() => {
      setSize(getWindowSize());
    });
  if (!isServer) makeEventListener(window, "resize", () => setSize(getWindowSize()));
  return size;
}

/**
 * Returns a reactive store-like object of current width and height dimensions of window, page and screen.
 *
 * This is a [singleton root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) primitive.
 *
 * @example
 * const size = useWindowSize();
 * createEffect(
 *   () => [size.width, size.height],
 *   ([width, height]) => console.log(width, height),
 * );
 */
export const useWindowSize: typeof createWindowSize =
  /*#__PURE__*/ createHydratableSingletonRoot(createWindowSize);

export type VisualViewportState = {
  /** Width of the visual viewport in CSS pixels. */
  width: number;
  /** Height of the visual viewport in CSS pixels. */
  height: number;
  /** Offset of the visual viewport from the top of the layout viewport. */
  offsetTop: number;
  /** Offset of the visual viewport from the left of the layout viewport. */
  offsetLeft: number;
  /** Offset of the visual viewport from the top of the page. */
  pageTop: number;
  /** Offset of the visual viewport from the left of the page. */
  pageLeft: number;
  /** Pinch-zoom scale factor. */
  scale: number;
};

export type VisualViewportOptions = {
  /** Coalesce bursts of `resize`/`scroll` events into one update per animation frame. */
  raf?: boolean;
};

const VISUAL_VIEWPORT_FALLBACK = {
  width: 0,
  height: 0,
  offsetTop: 0,
  offsetLeft: 0,
  pageTop: 0,
  pageLeft: 0,
  scale: 1,
} as const satisfies VisualViewportState;

/**
 * @returns the current state of `window.visualViewport`. Falls back to `window.innerWidth/innerHeight`
 * (scale 1, zero offsets) when the Visual Viewport API is unsupported, and to zeros on the server.
 */
export function getVisualViewport(): VisualViewportState {
  if (isServer) return { ...VISUAL_VIEWPORT_FALLBACK };
  const vv = window.visualViewport;
  if (!vv) {
    return {
      ...VISUAL_VIEWPORT_FALLBACK,
      width: window.innerWidth,
      height: window.innerHeight,
      pageLeft: window.scrollX || 0,
      pageTop: window.scrollY || 0,
    };
  }
  return {
    width: vv.width,
    height: vv.height,
    offsetTop: vv.offsetTop,
    offsetLeft: vv.offsetLeft,
    pageTop: vv.pageTop,
    pageLeft: vv.pageLeft,
    scale: vv.scale,
  };
}

/**
 * Listens to visual viewport `resize` and `scroll` events (or window `resize` when unsupported).
 * Does not call the callback initially. Auto-cleans on owner disposal.
 *
 * @param callback receives the new {@link VisualViewportState}
 * @returns manual cleanup function
 */
export function makeVisualViewportListener(
  callback: (state: VisualViewportState) => void,
  options: VisualViewportOptions = {},
): VoidFunction {
  if (isServer) return noop;
  let frame: number | undefined;
  const notify = () => callback(getVisualViewport());
  const handler = options.raf
    ? () => {
        if (frame === undefined)
          frame = requestAnimationFrame(() => {
            frame = undefined;
            notify();
          });
      }
    : notify;
  const vv = window.visualViewport;
  const clears: VoidFunction[] = vv
    ? [
        makeEventListener(vv, "resize", handler) as VoidFunction,
        makeEventListener(vv, "scroll", handler) as VoidFunction,
      ]
    : [makeEventListener(window, "resize", handler) as VoidFunction];
  let cleared = false;
  const clear = () => {
    if (cleared) return;
    cleared = true;
    clears.forEach(c => c());
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  };
  onCleanup(clear);
  return clear;
}

/**
 * Creates a reactive store-like object of the current visual viewport (size, offsets, pinch-zoom scale).
 * Useful for on-screen keyboard avoidance and pinch-zoom aware overlays.
 * @example
 * const vv = createVisualViewport();
 * createEffect(
 *   () => vv.height,
 *   height => console.log(height),
 * );
 */
export function createVisualViewport(
  options?: VisualViewportOptions,
): Readonly<VisualViewportState> {
  const [state, setState] = createStaticStore<VisualViewportState>(
    isServer || sharedConfig.hydrating ? VISUAL_VIEWPORT_FALLBACK : getVisualViewport(),
  );
  if (isServer) return state;
  if (sharedConfig.hydrating)
    onSettled(() => {
      setState(getVisualViewport());
    });
  makeVisualViewportListener(next => {
    setState(next);
  }, options);
  return state;
}

/**
 * Returns a shared reactive visual viewport object. Singleton root version of {@link createVisualViewport}.
 */
export const useVisualViewport: () => Readonly<VisualViewportState> =
  /*#__PURE__*/ createHydratableSingletonRoot(() => createVisualViewport());

const ELEMENT_SIZE_FALLBACK = {
  width: null,
  height: null,
  clientWidth: null,
  clientHeight: null,
} as const satisfies NullableSize;

/**
 * @param target html element
 * @returns object with width/height (from `getBoundingClientRect`, border-box, affected by CSS transforms)
 * and clientWidth/clientHeight (padding-box, unaffected by CSS transforms) of the provided {@link target} element.
 */
export function getElementSize(target: Element): SizeWithClient;
export function getElementSize(target: Element | false | undefined | null): NullableSize;
export function getElementSize(target: Element | false | undefined | null): NullableSize {
  if (isServer || !target) {
    return { ...ELEMENT_SIZE_FALLBACK };
  }
  const { width, height } = target.getBoundingClientRect();
  return { width, height, clientWidth: target.clientWidth, clientHeight: target.clientHeight };
}

/**
 * Creates a reactive store-like object of current width/height and clientWidth/clientHeight dimensions of {@link target} element.
 * @param target html element to track the size of. Can be a reactive signal.
 * @returns `{ width: number, height: number, clientWidth: number, clientHeight: number }`
 * @example
 * const size = createElementSize(document.body);
 * createEffect(
 *   () => [size.width, size.height, size.clientWidth, size.clientHeight],
 *   ([width, height, clientWidth, clientHeight]) => console.log(width, height, clientWidth, clientHeight),
 * );
 */
export function createElementSize(target: Element): Readonly<SizeWithClient>;
export function createElementSize(
  target: Accessor<Element | false | undefined | null>,
): Readonly<NullableSize>;
export function createElementSize(
  target: Accessor<Element | false | undefined | null> | Element,
): Readonly<NullableSize> {
  if (isServer) {
    // Reserve the same hydration child id as the client-side target effect,
    // without evaluating the accessor or touching browser APIs on the server.
    if (typeof target === "function") createEffect(noop, noop);
    return ELEMENT_SIZE_FALLBACK;
  }

  const isFn = typeof target === "function";

  const [size, setSize] = createStaticStore(
    sharedConfig.hydrating || isFn ? ELEMENT_SIZE_FALLBACK : getElementSize(target),
  );

  const ro = new ResizeObserver(([e]) => setSize(getElementSize(e!.target)));
  onCleanup(() => ro.disconnect());

  if (isFn) {
    createEffect(
      () => target(),
      (el: Element | false | null | undefined) => {
        if (el) {
          setSize(getElementSize(el));
          ro.observe(el);
          return () => ro.unobserve(el);
        } else {
          setSize(ELEMENT_SIZE_FALLBACK);
        }
      },
    );
  } else {
    ro.observe(target);
    onCleanup(() => ro.unobserve(target));
  }

  return size;
}
