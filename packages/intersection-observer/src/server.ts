import { Accessor } from "solid-js";

import {
  AddIntersectionObserverEntry,
  AddViewportObserverEntry,
  CreateViewportObserverReturnValue,
  EntryCallback,
  MaybeAccessor,
  RemoveIntersectionObserverEntry,
  RemoveViewportObserverEntry
} from "./index";

export {
  AddIntersectionObserverEntry,
  AddViewportObserverEntry,
  CreateViewportObserverReturnValue,
  EntryCallback,
  MaybeAccessor,
  RemoveIntersectionObserverEntry,
  RemoveViewportObserverEntry
};

/**
 * Creates a very basic Intersection Observer.
 *
 * > ⚠️ this server api is defunct
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
 * const [add, { remove, start, stop, instance }] = createIntersectionObserver(els, entries =>
 *   console.log(entries)
 * );
 *
 * // directive usage:
 * const [observer] = createIntersectionObserver(els, () => {...})
 * <div use:observer></div>
 * ```
 */
export const createIntersectionObserver = (
  _elements: MaybeAccessor<Element[]>,
  _onChange: IntersectionObserverCallback,
  _options?: IntersectionObserverInit
): [
  AddIntersectionObserverEntry,
  {
    remove: RemoveIntersectionObserverEntry;
    start: () => void;
    stop: () => void;
    instance: IntersectionObserver;
  }
] => [
  _el => {
    /* noop */
  },
  {
    remove: _el => {
      /* noop */
    },
    start: () => {
      /* noop */
    },
    stop: () => {
      /* noop */
    },
    instance: {} as unknown as IntersectionObserver
  }
];

/**
 * Creates a more advanced viewport observer for complex tracking.
 *
 * > ⚠️ this server api is defunct
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
 * const [add, { remove, start, stop, instance }] = createViewportObserver(els, e => {...});
 * add(el, e => console.log(e.isIntersecting))
 *
 * // directive usage:
 * const [observer] = createIntersectionObserver()
 * <div use:observer={(e) => console.log(e.isIntersecting)}></div>
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

export function createViewportObserver(...a: any): CreateViewportObserverReturnValue {
  return [
    (_el: Element) => {
      /* void */
    },
    {
      remove: (_el: Element) => {
        /* void */
      },
      start: () => {
        /* void */
      },
      stop: () => {
        /* void */
      },
      instance: {} as unknown as IntersectionObserver
    }
  ];
}

/**
 * Creates reactive signal that changes when element's visibility changes
 *
 * > ⚠️ this server api is defunct
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
  _element: MaybeAccessor<Element>,
  _options?: IntersectionObserverInit & {
    initialValue?: boolean;
    once?: boolean;
  }
): [Accessor<boolean>, { start: () => void; stop: () => void; instance: IntersectionObserver }] => {
  return [
    () => false,
    {
      start: () => {
        /* noop */
      },
      stop: () => {
        /* noop */
      },
      instance: {} as unknown as IntersectionObserver
    }
  ];
};
