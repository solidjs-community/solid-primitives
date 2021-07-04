import { onMount, onCleanup } from "solid-js";

/**
 * Create event listenere is a helper primitiive for binding events.
 *
 * @param eventName - Event name to bind to
 * @param handler - Function handler to trigger
 * @param element - HTML element to bind the event to
 *
 * @example
 * ```ts
 * createEventListener("mouseDown", () => console.log("Click"), document.getElementById("mybutton"))
 * ```
 */
const createEventListener = <T extends HTMLElement = HTMLDivElement>(
  eventName: keyof WindowEventMap,
  handler: (event: Event) => void,
  targets: T | Window | [T | Window] = window
) => {
  const add = (target: T | Window | [T | Window]): void =>
    target.addEventListener && target.addEventListener(eventName, handler);
  const remove = (target: T | Window | [T | Window]): void =>
    target.removeEventListener &&
    target.removeEventListener(eventName, handler);

  // Define the listening target
  onMount(() => (Array.isArray(targets) ? targets.forEach(add) : add(targets)));
  onCleanup(() =>
    Array.isArray(targets) ? targets.forEach(remove) : remove(targets)
  );
};

export default createEventListener;
