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
  // Create a ref that stores handler
  let targetElements: Array<T | Window> = Array.isArray(targets)
    ? targets
    : [targets];

  // Define the listening target
  onMount(() =>
    targetElements.map(
      (target) =>
        target?.addEventListener && target?.addEventListener(eventName, handler)
    )
  );
  onCleanup(() =>
    targetElements.map(
      (target) =>
        target?.addEventListener &&
        target?.removeEventListener(eventName, handler)
    )
  );
};

export default createEventListener;
