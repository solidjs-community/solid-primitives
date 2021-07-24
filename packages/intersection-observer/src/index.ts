import { onMount, onCleanup } from "solid-js";

/**
 * Creates a very basic Intersection Observer.
 *
 * @param elements - A list of elements to watch
 * @param onChange - An event handler that returns an array of observer entires
 * @param threshold - Threshold of when to detect above a particular point
 * @param root - Root element used as viewport for checking visibility
 * @param rootMarigin - Root margin around theoot
 *
 * @example
 * ```ts
 * const [ add, remove, start, stop ] = createIntersectionObserver(els);
 * ```
 */
export const createIntersectionObserver = (
  elements: Array<HTMLElement>,
  onChange: (entries: Array<IntersectionObserverEntry>) => void,
  threshold: number = 0,
  root: Element | null = null,
  rootMargin: string = "0%"
): [
  add: (el: HTMLElement) => void,
  remove: (el: HTMLElement) => void,
  start: () => void,
  stop: () => void,
  observer: IntersectionObserver
] => {
  // If not supported, skip
  const observer = new IntersectionObserver(onChange, { threshold, root, rootMargin });
  const add = (el: Element) => observer.observe(el);
  const remove = (el: Element) => observer.unobserve(el);
  const start = () => elements.forEach(el => add(el));
  const stop = () => observer.takeRecords().forEach(entry => remove(entry.target));
  onMount(start);
  onCleanup(stop);
  return [add, remove, start, stop, observer];
};

type SetEntry = (
  v: IntersectionObserverEntry | ((prev: IntersectionObserverEntry) => IntersectionObserverEntry)
) => IntersectionObserverEntry;

/**
 * Creates a more advanced viewport observer for complex tracking.
 *
 * @param elements - A list of elements to watch
 * @param threshold - Threshold of when to detect above a particular point
 * @param root - Root element used as viewport for checking visibility
 * @param rootMarigin - Root margin around theoot
 *
 * @example
 * ```ts
 * const [ add, remove, start, stop ] = createIntersectionObserver(el);
 * ```
 */
export const createViewportObserver = (
  elements: Array<HTMLElement> = [],
  threshold: number = 0,
  root: HTMLElement | null = null,
  rootMargin: string = "0%"
): [
  addEntry: (el: HTMLElement, setter: SetEntry) => void,
  removeEntry: (el: HTMLElement) => void,
  start: () => void,
  stop: () => void
] => {
  const setters = new WeakMap<Element, SetEntry>();
  const onChange = (entries: Array<IntersectionObserverEntry>) =>
    entries.forEach(entry => setters.get(entry.target)!(entry));
  const [add, remove, start, stop] = createIntersectionObserver(
    elements,
    onChange,
    threshold,
    root,
    rootMargin
  );
  const addEntry = (el: HTMLElement, setter: SetEntry): void => {
    add(el);
    setters.set(el, setter);
  };
  const removeEntry = (el: HTMLElement) => {
    setters.delete(el);
    remove(el);
  };
  onMount(start);
  return [addEntry, removeEntry, start, stop];
};
