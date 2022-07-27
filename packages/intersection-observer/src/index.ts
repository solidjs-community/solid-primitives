import { onMount, onCleanup, createSignal, createEffect, untrack } from "solid-js";
import type { JSX, Accessor } from "solid-js";
import { access, MaybeAccessor } from "@solid-primitives/utils";

export type AddIntersectionObserverEntry = (el: Element) => void;
export type RemoveIntersectionObserverEntry = (el: Element) => void;

export type EntryCallback = (
  entry: IntersectionObserverEntry,
  instance: IntersectionObserver
) => void;
export type AddViewportObserverEntry = (
  el: Element,
  callback: MaybeAccessor<EntryCallback>
) => void;
export type RemoveViewportObserverEntry = (el: Element) => void;

export type CreateViewportObserverReturnValue = [
  AddViewportObserverEntry,
  {
    remove: RemoveViewportObserverEntry;
    start: () => void;
    stop: () => void;
    instance: IntersectionObserver;
  }
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
export const makeIntersectionObserver = (
  elements: Element[],
  onChange: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): {
  add: AddIntersectionObserverEntry;
  remove: RemoveIntersectionObserverEntry;
  start: VoidFunction;
  reset: VoidFunction;
  stop: VoidFunction;
  instance: IntersectionObserver;
} => {
  const instance = new IntersectionObserver(onChange, options);
  const add: AddIntersectionObserverEntry = el => instance.observe(access(el));
  const remove: RemoveIntersectionObserverEntry = el => instance.unobserve(access(el));
  const start = () => elements.forEach(el => add(el));
  const stop = () => instance.disconnect();
  const reset = () => instance.takeRecords().forEach(el => remove(el.target));
  onMount(start);
  onCleanup(stop);
  return { add, remove, start, stop, reset, instance };
};

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
export const createIntersectionObserver = (
  elements: Accessor<Element[]>,
  onChange: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  const { add, reset } = makeIntersectionObserver([], onChange, options);
  createEffect(() => {
    reset();
    access(elements).forEach(el => add(el));
  });
};

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
  options?: IntersectionObserverInit
): CreateViewportObserverReturnValue;

export function createViewportObserver(
  initial: MaybeAccessor<[Element, EntryCallback][]>,
  options?: IntersectionObserverInit
): CreateViewportObserverReturnValue;

export function createViewportObserver(
  options?: IntersectionObserverInit
): CreateViewportObserverReturnValue;

export function createViewportObserver(...a: any) {
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

export type VisibilityCallback<Ctx extends {} = {}> = (
  entry: IntersectionObserverEntry,
  context: Ctx & { visible: boolean }
) => boolean;

const trueFn = () => true;
const falseFn = () => false;

/**
 * Creates reactive signal that changes when a single element's visibility changes.
 *
 * @param element - An element to watch
 * @param options - A Primitive and IntersectionObserver constructor options:
 * - `root` — The Element or Document whose bounds are used as the bounding box when testing for intersection.
 * - `rootMargin` — A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections, effectively shrinking or growing the root for calculation purposes.
 * - `threshold` — Either a single number or an array of numbers between 0.0 and 1.0, specifying a ratio of intersection area to total bounding box area for the observed target.
 * - `initialValue` — Initial value of the signal *(default: false)*
 * - `once` — If true: the stop function will be called automatically after visibility changes *(default: false)*
 *
 * @example
 * ```ts
 * let el!: HTMLElement
 * const [isVisible, { start, stop, instance }] = createVisibilityObserver(() => el, { once: true })
 * ```
 */
export const createVisibilityObserver = (
  options?: IntersectionObserverInit & {
    initialValue?: boolean;
  },
  guard?: () => VisibilityCallback
): ((element: MaybeAccessor<Element | undefined | false | null>) => Accessor<boolean>) => {
  const callbacks = new WeakMap<Element, EntryCallback>();

  const { add, remove } = makeIntersectionObserver(
    [],
    (entries, instance) => {
      entries.forEach(entry => callbacks.get(entry.target)?.(entry, instance));
    },
    options
  );

  function removeEntry(el: Element) {
    remove(el);
    callbacks.delete(el);
  }
  function addEntry(el: Element, callback: EntryCallback) {
    add(el);
    callbacks.set(el, callback);
  }

  const getCallback: (
    getter: Accessor<boolean>,
    setter: (state: boolean) => void
  ) => EntryCallback = guard
    ? (getter, setter) => {
        const cbGuard = guard();
        return entry => setter(cbGuard(entry, { visible: untrack(getter) }));
      }
    : (_, setter) => entry => setter(entry.isIntersecting);

  return element => {
    const [isVisible, setVisible] = createSignal(options?.initialValue ?? false);
    const callback = getCallback(isVisible, setVisible);
    let prevEl: Element | undefined | false | null;

    if (typeof element === "function") {
      createEffect(() => {
        const el = element();
        if (el === prevEl) return;
        if (prevEl) removeEntry(prevEl);
        if (el) addEntry(el, callback);
        prevEl = el;
      });
    } else if (element) addEntry(element, callback);

    onCleanup(() => prevEl && removeEntry(prevEl));

    return isVisible;
  };
};

export enum Occurrence {
  Entering = "Entering",
  Leaving = "Leaving",
  Inside = "Inside",
  Outside = "Outside"
}

export function getOccurrence(
  isIntersecting: boolean,
  prevIsIntersecting: boolean | undefined
): Occurrence {
  return isIntersecting
    ? prevIsIntersecting
      ? Occurrence.Inside
      : Occurrence.Entering
    : prevIsIntersecting === undefined || prevIsIntersecting === true
    ? Occurrence.Leaving
    : Occurrence.Outside;
}

export function withOccurrence<Ctx extends {}>(
  callback: MaybeAccessor<VisibilityCallback<Ctx & { occurrence: Occurrence }>>
): () => VisibilityCallback<Ctx> {
  return () => {
    let prevIntersecting: boolean | undefined;
    const cb = access(callback);

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
  None = "None"
}

export enum DirectionY {
  Top = "Top",
  Bottom = "Bottom",
  None = "None"
}

export function getDirection(
  rect: DOMRectReadOnly,
  prevRect: DOMRectReadOnly | undefined,
  intersecting: boolean
): { directionX: DirectionX; directionY: DirectionY } {
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

export function withDirection<Ctx extends {}>(
  callback: MaybeAccessor<
    VisibilityCallback<Ctx & { directionX: DirectionX; directionY: DirectionY }>
  >
): () => VisibilityCallback<Ctx> {
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
