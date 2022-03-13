import { onMount, createSignal, onCleanup, Accessor } from "solid-js";

/**
 * Create a visibility observer is a helper primitive for tracking when the page is visible.
 *
 * @return Returns a signel with a boolean value identifying the visibility state.
 *
 */
const createPageVisibilityObserver = (): Accessor<boolean> => {
  const visible = () =>
    document ? document.visibilityState === "visible" : true;
  const [state, setState] = createSignal(visible());
  const cb = () => setState(visible());
  onMount(() => {
    document.addEventListener("visibilitychange", cb);
    onCleanup(() => document.removeEventListener("visibilitychange", cb));
  });
  return state;
};

export default createPageVisibilityObserver;
