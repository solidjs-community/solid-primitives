import { onMount, onCleanup, createSignal, Accessor } from "solid-js";

export interface IntersectionObserverOptions {
  readonly root?: Element | Document | null;
  readonly rootMargin?: string;
  readonly threshold?: number | number[];
}

/**
 * Creates a very basic Intersection Observer.
 *
 * @param elements - A list of elements to watch
 * @param onChange - An event handler that returns an array of observer entires
 * @param options - IntersectionObserver constructor options:
 * - `root` — The Element or Document whose bounds are used as the bounding box when testing for intersection.
 * - `rootMargin` — A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections, effectively shrinking or growing the root for calculation purposes.
 * - `threshold` — Either a single number or an array of numbers between 0.0 and 1.0, specifying a ratio of intersection area to total bounding box area for the observed target.
 *
 * @example
 * ```ts
 * const { add, remove, start, stop, observer } = createIntersectionObserver(els, entries =>
 *   console.log(entries)
 * );
 * ```
 */
export const createIntersectionObserver = (
  elements: Element[] | Accessor<Element[]>,
  onChange: IntersectionObserverCallback,
  options?: IntersectionObserverOptions
): {
  add: (el: Element) => void;
  remove: (el: Element) => void;
  start: () => void;
  stop: () => void;
  observer: IntersectionObserver;
} => {
  // If not supported, skip
  const observer = new IntersectionObserver(onChange, options);
  const getElements = typeof elements === "function" ? elements : () => elements;
  const add = (el: Element) => observer.observe(el);
  const remove = (el: Element) => observer.unobserve(el);
  const start = () => getElements().forEach(el => add(el));
  const stop = () => observer.takeRecords().forEach(entry => remove(entry.target));
  onMount(start);
  onCleanup(stop);
  return { add, remove, start, stop, observer };
};

export type EntryCallback = (entry: IntersectionObserverEntry) => void;

/**
 * Creates a more advanced viewport observer for complex tracking.
 *
 * @param options - IntersectionObserver constructor options:
 * - `root` — The Element or Document whose bounds are used as the bounding box when testing for intersection.
 * - `rootMargin` — A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections, effectively shrinking or growing the root for calculation purposes.
 * - `threshold` — Either a single number or an array of numbers between 0.0 and 1.0, specifying a ratio of intersection area to total bounding box area for the observed target.
 *
 * @example
 * ```ts
 * const { add, remove, start, stop } = createViewportObserver();
 * add(el, e => console.log(e.isIntersecting))
 * ```
 */
export const createViewportObserver = (
  options?: IntersectionObserverOptions
): {
  add: (el: HTMLElement, setter: EntryCallback) => void;
  remove: (el: HTMLElement) => void;
  start: () => void;
  stop: () => void;
} => {
  const callbacks = new WeakMap<Element, EntryCallback>();
  const onChange = (entries: Array<IntersectionObserverEntry>) =>
    entries.forEach(entry => callbacks.get(entry.target)!(entry));
  const { add, remove, start, stop } = createIntersectionObserver([], onChange, options);
  const addEntry = (el: HTMLElement, setter: EntryCallback): void => {
    add(el);
    callbacks.set(el, setter);
  };
  const removeEntry = (el: HTMLElement) => {
    callbacks.delete(el);
    remove(el);
  };
  onMount(start);
  return { add: addEntry, remove: removeEntry, start, stop };
};

/**
 * Creates reactive signal that changes when element's visibility changes
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
 * const [isVisible, { start, stop }] = createVisibilityObserver(() => el, { once: true })
 * ```
 */
export const createVisibilityObserver = (
  element: Element | Accessor<Element>,
  options?: IntersectionObserverOptions & {
    initialValue?: boolean;
    once?: boolean;
  }
): [Accessor<boolean>, { start: () => void; stop: () => void }] => {
  const [isVisible, setVisible] = createSignal(options?.initialValue || false);
  const getEl = typeof element === "function" ? element : () => element;
  const { start, stop } = createIntersectionObserver(
    () => [getEl()],
    ([entry]) => {
      setVisible(entry.isIntersecting);
      if (options?.once && entry.isIntersecting !== !!options?.initialValue) stop();
    },
    options
  );
  return [isVisible, { start, stop }];
};
