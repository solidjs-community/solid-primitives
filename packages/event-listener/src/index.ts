import { createEffect, onCleanup } from 'solid-js';

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
const createListener = <T extends HTMLElement = HTMLDivElement>(
   eventName: keyof WindowEventMap,
   handler: (event: Event) => void,
   element?: T | HTMLElement | Window,
) => {
  // Create a ref that stores handler
  let savedHandler: (event: Event) => void;
  let targetElement: T | HTMLElement | Window;
  
  // Create event listener that calls handler function stored in ref
  const eventListener = (event: Event) => {
    // eslint-disable-next-line no-extra-boolean-cast
    if (!!savedHandler) {
      savedHandler(event)
    }
  }

  createEffect(() => {
    // Define the listening target
    targetElement = element || window;
    if (!targetElement?.addEventListener) {
      return
    }
    // Update saved handler if necessary
    if (savedHandler !== handler) {
      savedHandler = handler
    }
    targetElement.addEventListener(eventName, eventListener);
  });
  onCleanup(() => targetElement.removeEventListener(eventName, eventListener));

}
 
export default createListener;
