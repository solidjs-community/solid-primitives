import { onMount, onCleanup } from "solid-js";

/**
 * Creates an event listener helper primitive.
 *
 * @param eventName - Event name to bind to
 * @param handler - Function handler to trigger
 * @param element - HTML element to bind the event to
 * @param options - *useCapture* boolean or an object that specifies characteristics about the event listener.
 *
 * @example
 * ```ts
 * createEventListener("mouseDown", () => console.log("Click"), document.getElementById("mybutton"))
 * ```
 */
const createEventListener = <T extends HTMLElement, E extends keyof WindowEventMap>(
  eventName: E,
  handler: (event: WindowEventMap[E]) => void,
  targets: T | Array<T> | Window = window,
  options?: boolean | AddEventListenerOptions
): readonly [add: (el: T | Window) => void, remove: (el: T | Window) => void] => {
  const add = (target: T | Window): void =>
    target.addEventListener &&
    target.addEventListener(eventName, handler as EventListenerOrEventListenerObject, options);
  const remove = (target: T | Window): void =>
    target.removeEventListener &&
    target.removeEventListener(eventName, handler as EventListenerOrEventListenerObject, options);
  onMount(() => (Array.isArray(targets) ? targets.forEach(add) : add(targets)));
  onCleanup(() => (Array.isArray(targets) ? targets.forEach(remove) : remove(targets)));
  return [add, remove];
};

export default createEventListener;
