import { onMount, onCleanup, createSignal, createEffect, untrack, Setter, DEV } from "solid-js";
import type { JSX, Accessor } from "solid-js";
import { isServer } from "solid-js/web";
import { access, FalsyValue, MaybeAccessor } from "@solid-primitives/utils";

export type AddIntersectionObserverEntry = (el: Element) => void;
export type RemoveIntersectionObserverEntry = (el: Element) => void;

export type EntryCallback = (
  entry: IntersectionObserverEntry,
  instance: IntersectionObserver,
) => void;
export type AddViewportObserverEntry = (
  el: Element,
  callback: MaybeAccessor<EntryCallback>,
) => void;
export type RemoveViewportObserverEntry = (el: Element) => void;

export type CreateViewportObserverReturnValue = [
  AddViewportObserverEntry,
  {
    remove: RemoveViewportObserverEntry;
    start: () => void;
    stop: () => void;
    instance: IntersectionObserver;
  },
];

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      intersectionObserver: true | EntryCallback;
    }
  }
}

// This ensures the `JSX` import won't fall victim to tree shaking before
// TypesScript can use it
export type E = JSX.Element;

/**
 * Generates a very basic Intersection Observer with basic control interface.
 *
 * @param elements - A list of elements to watch
 * @param onChange - An event handler that returns an array of observer entires
 * @param options - IntersectionObserver constructor options:
 * - `root` — The Element or Document whose bounds are used as the bounding box when testing for intersection.
 * - `rootMargin` — A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections, effectively shrinking or growing the root for calculation purposes.
 * - `threshold` — Either a single number or an array of numbers between 0.0 and 1.0, specifying a ratio of intersection area to total bounding box area for the observed target.
 *
 * @example
 * ```tsx
 * const { add, remove, start, stop, instance } = makeIntersectionObserver(els, entries =>
 *   console.log(entries)
 * );
 * ```
 */
export function makeIntersectionObserver(
  elements: Element[],
  onChange: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
): {
  add: AddIntersectionObserverEntry;
  remove: RemoveIntersectionObserverEntry;
  start: VoidFunction;
  reset: VoidFunction;
  stop: VoidFunction;
  instance: IntersectionObserver;
} {
  if (isServer)
    return {
      add: () => void 0,
      remove: () => void 0,
      start: () => void 0,
      reset: () => void 0,
      stop: () => void 0,
      instance: {} as unknown as IntersectionObserver,
    };

  const instance = new IntersectionObserver(onChange, options);
  const add: AddIntersectionObserverEntry = el => {
    // Elements with 'display: "contents"' don't work with IO, even if they are visible by users
    // (https://github.com/solidjs-community/solid-primitives/issues/116)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!isServer && DEV && el instanceof HTMLElement && el.style.display === "contents") {
      // eslint-disable-next-line no-console
      console.warn(
        `[@solid-primitives/intersection-observer/makeIntersectionObserver] IntersectionObserver is not able to observe elements with 'display: "contents"' style:`,
        el,
      );
      return;
    }
    instance.observe(el);
  };
  const remove: RemoveIntersectionObserverEntry = el => instance.unobserve(el);
  const start = () => elements.forEach(add);
  const stop = () => instance.disconnect();
  const reset = () => instance.takeRecords().forEach(el => remove(el.target));
  start();
  onCleanup(stop);
  return { add, remove, start, stop, reset, instance };
}

/**
 * Creates a reactive Intersection Observer primitive.
 *
 * @param elements - A list of elements to watch
 * @param onChange - An event handler that returns an array of observer entires
 * @param options - IntersectionObserver constructor options:
 * - `root` — The Element or Document whose bounds are used as the bounding box when testing for intersection.
 * - `rootMargin` — A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections, effectively shrinking or growing the root for calculation purposes.
 * - `threshold` — Either a single number or an array of numbers between 0.0 and 1.0, specifying a ratio of intersection area to total bounding box area for the observed target.
 *
 * @example
 * ```tsx
 * const createIntersectionObserver(els, entries =>
 *   console.log(entries)
 * );
 * ```
 */
export function createIntersectionObserver(
  elements: Accessor<Element[]>,
  onChange: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
): void {
  if (isServer) return;
  const { add, reset } = makeIntersectionObserver([], onChange, options);
  createEffect(() => {
    reset();
    access(elements).forEach(el => add(el));
  });
}

/**
 * Creates a more advanced viewport observer for complex tracking with multiple objects in a single IntersectionObserver instance.
 *
 * @param elements - A list of elements to watch
 * @param callback - Element intersection change event handler
 * @param options - IntersectionObserver constructor options:
 * - `root` — The Element or Document whose bounds are used as the bounding box when testing for intersection.
 * - `rootMargin` — A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections, effectively shrinking or growing the root for calculation purposes.
 * - `threshold` — Either a single number or an array of numbers between 0.0 and 1.0, specifying a ratio of intersection area to total bounding box area for the observed target.
 *
 * @example
 * ```tsx
 * const [add, { remove, start, stop, instance }] = createViewportObserver(els, (e) => {...});
 * add(el, e => console.log(e.isIntersecting))
 *
 * // directive usage:
 * const [intersectionObserver] = createViewportObserver()
 * <div use:intersectionObserver={(e) => console.log(e.isIntersecting)}></div>
 * ```
 */
export function createViewportObserver(
  elements: MaybeAccessor<Element[]>,
  callback: EntryCallback,
  options?: IntersectionObserverInit,
): CreateViewportObserverReturnValue;

export function createViewportObserver(
  initial: MaybeAccessor<[Element, EntryCallback][]>,
  options?: IntersectionObserverInit,
): CreateViewportObserverReturnValue;

export function createViewportObserver(
  options?: IntersectionObserverInit,
): CreateViewportObserverReturnValue;

export function createViewportObserver(...a: any) {
  if (isServer) {
    return [() => void 0, { start: () => void 0, stop: () => void 0 }];
  }

  let initial: [Element, EntryCallback][] = [];
  let options: IntersectionObserverInit = {};
  if (Array.isArray(a[0]) || a[0] instanceof Function) {
    if (a[1] instanceof Function) {
      initial = access<Element[]>(a[0]).map(el => [el, a[1]]);
      options = a[2];
    } else {
      initial = access(a[0]);
      options = a[1];
    }
  } else options = a[0];
  const callbacks = new WeakMap<Element, MaybeAccessor<EntryCallback>>();
  const onChange: IntersectionObserverCallback = (entries, instance) =>
    entries.forEach(entry => {
      const cb = callbacks.get(entry.target)?.(entry, instance);
      // Additional check to prevent errors when the user
      // use "observe" directive without providing a callback
      cb instanceof Function && cb(entry, instance);
    });
  const { add, remove, stop, instance } = makeIntersectionObserver([], onChange, options);
  const addEntry: AddViewportObserverEntry = (el, callback) => {
    add(el);
    callbacks.set(el, callback);
  };
  const removeEntry: RemoveViewportObserverEntry = el => {
    callbacks.delete(el);
    remove(el);
  };
  const start = () => initial.forEach(([el, cb]) => addEntry(el, cb));
  onMount(start);
  return [addEntry, { remove: removeEntry, start, stop, instance }];
}

export type VisibilitySetter<Ctx extends {} = {}> = (
  entry: IntersectionObserverEntry,
  context: Ctx & { visible: boolean },
) => boolean;

/**
 * Creates reactive signal that changes when a single element's visibility changes.
 *
 * @param options - A Primitive and IntersectionObserver constructor options:
 * - `root` — The Element or Document whose bounds are used as the bounding box when testing for intersection.
 * - `rootMargin` — A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections, effectively shrinking or growing the root for calculation purposes.
 * - `threshold` — Either a single number or an array of numbers between 0.0 and 1.0, specifying a ratio of intersection area to total bounding box area for the observed target.
 * - `initialValue` — Initial value of the signal *(default: false)*
 *
 * @returns A configured *"use"* function for creating a visibility signal for a single element. The passed element can be a **reactive signal** or a DOM element. Returning a falsy value will remove the element from the observer.
 * ```ts
 * (element: Accessor<Element | FalsyValue> | Element) => Accessor<boolean>
 * ```
 *
 * @example
 * ```tsx
 * let el: HTMLDivElement | undefined
 * const useVisibilityObserver = createVisibilityObserver({ threshold: 0.8 })
 * const visible = useVisibilityObserver(() => el)
 * <div ref={el}>{ visible() ? "Visible" : "Hidden" }</div>
 * ```
 */
export function createVisibilityObserver(
  options?: IntersectionObserverInit & {
    initialValue?: boolean;
  },
  setter?: MaybeAccessor<VisibilitySetter>,
): (element: Accessor<Element | FalsyValue> | Element) => Accessor<boolean> {
  if (isServer) {
    return () => () => false;
  }

  const callbacks = new WeakMap<Element, EntryCallback>();

  const { add, remove } = makeIntersectionObserver(
    [],
    (entries, instance) => {
      entries.forEach(entry => callbacks.get(entry.target)?.(entry, instance));
    },
    options,
  );

  function removeEntry(el: Element) {
    remove(el);
    callbacks.delete(el);
  }
  function addEntry(el: Element, callback: EntryCallback) {
    add(el);
    callbacks.set(el, callback);
  }

  const getCallback: (get: Accessor<boolean>, set: Setter<boolean>) => EntryCallback = setter
    ? (get, set) => {
        const setterRef = access(setter);
        return entry => set(setterRef(entry, { visible: untrack(get) }));
      }
    : (_, set) => entry => set(entry.isIntersecting);

  return element => {
    const [isVisible, setVisible] = createSignal(options?.initialValue ?? false);
    const callback = getCallback(isVisible, setVisible);
    let prevEl: Element | FalsyValue;

    if (!(element instanceof Element)) {
      createEffect(() => {
        const el = element();
        if (el === prevEl) return;
        if (prevEl) removeEntry(prevEl);
        if (el) addEntry(el, callback);
        prevEl = el;
      });
    } else addEntry(element, callback);

    onCleanup(() => prevEl && removeEntry(prevEl));

    return isVisible;
  };
}

export enum Occurrence {
  Entering = "Entering",
  Leaving = "Leaving",
  Inside = "Inside",
  Outside = "Outside",
}

/**
 * Calculates the occurrence of an element in the viewport.
 */
export function getOccurrence(
  isIntersecting: boolean,
  prevIsIntersecting: boolean | undefined,
): Occurrence {
  if (isServer) {
    return Occurrence.Outside;
  }
  return isIntersecting
    ? prevIsIntersecting
      ? Occurrence.Inside
      : Occurrence.Entering
    : prevIsIntersecting === true
    ? Occurrence.Leaving
    : Occurrence.Outside;
}

/**
 * A visibility setter factory function. It provides information about element occurrence in the viewport — `"Entering"`, `"Leaving"`, `"Inside"` or `"Outside"`.
 * @param setter - A function that sets the occurrence of an element in the viewport.
 * @returns A visibility setter function.
 * @example
 * ```ts
 * const useVisibilityObserver = createVisibilityObserver(
 *  { threshold: 0.8 },
 *  withOccurrence((entry, { occurrence }) => {
 *    console.log(occurrence);
 *    return entry.isIntersecting;
 *  })
 * );
 * ```
 */
export function withOccurrence<Ctx extends {}>(
  setter: MaybeAccessor<VisibilitySetter<Ctx & { occurrence: Occurrence }>>,
): () => VisibilitySetter<Ctx> {
  if (isServer) {
    return () => () => false;
  }
  return () => {
    let prevIntersecting: boolean | undefined;
    const cb = access(setter);

    return (entry, ctx) => {
      const { isIntersecting } = entry;
      const occurrence = getOccurrence(isIntersecting, prevIntersecting);
      prevIntersecting = isIntersecting;
      return cb(entry, { ...ctx, occurrence });
    };
  };
}

export enum DirectionX {
  Left = "Left",
  Right = "Right",
  None = "None",
}

export enum DirectionY {
  Top = "Top",
  Bottom = "Bottom",
  None = "None",
}

/**
 * Calculates the direction of an element in the viewport. The direction is calculated based on the element's rect, it's previous rect and the `isIntersecting` flag.
 * @returns A direction string: `"Left"`, `"Right"`, `"Top"`, `"Bottom"` or `"None"`.
 */
export function getDirection(
  rect: DOMRectReadOnly,
  prevRect: DOMRectReadOnly | undefined,
  intersecting: boolean,
): { directionX: DirectionX; directionY: DirectionY } {
  if (isServer) {
    return {
      directionX: DirectionX.None,
      directionY: DirectionY.None,
    };
  }
  let directionX = DirectionX.None;
  let directionY = DirectionY.None;
  if (!prevRect) return { directionX, directionY };
  if (rect.top < prevRect.top) directionY = intersecting ? DirectionY.Bottom : DirectionY.Top;
  else if (rect.top > prevRect.top) directionY = intersecting ? DirectionY.Top : DirectionY.Bottom;
  if (rect.left > prevRect.left) directionX = intersecting ? DirectionX.Left : DirectionX.Right;
  else if (rect.left < prevRect.left)
    directionX = intersecting ? DirectionX.Right : DirectionX.Left;
  return { directionX, directionY };
}

/**
 * A visibility setter factory function. It provides information about element direction on the screen — `"Left"`, `"Right"`, `"Top"`, `"Bottom"` or `"None"`.
 * @param setter - A function that sets the occurrence of an element in the viewport.
 * @returns A visibility setter function.
 * @example
 * ```ts
 * const useVisibilityObserver = createVisibilityObserver(
 *  { threshold: 0.8 },
 *  withDirection((entry, { directionY, directionX, visible }) => {
 *    if (!entry.isIntersecting && directionY === "Top" && visible) {
 *      return true;
 *    }
 *    return entry.isIntersecting;
 *  })
 * );
 * ```
 */
export function withDirection<Ctx extends {}>(
  callback: MaybeAccessor<
    VisibilitySetter<Ctx & { directionX: DirectionX; directionY: DirectionY }>
  >,
): () => VisibilitySetter<Ctx> {
  if (isServer) {
    return () => () => false;
  }
  return () => {
    let prevBounds: DOMRectReadOnly | undefined;
    const cb = access(callback);

    return (entry, ctx) => {
      const { boundingClientRect } = entry;
      const direction = getDirection(boundingClientRect, prevBounds, entry.isIntersecting);
      prevBounds = boundingClientRect;
      return cb(entry, { ...ctx, ...direction });
    };
  };
}
