import { onMount, createSignal, onCleanup, Accessor } from "solid-js";

/**
 * Create a visibility observer is a helper primitive for tracking when the page is visible.
 *
 * @return Returns a signel with a boolean value identifying the visibility state.
 *
 */
function createPageVisibilityObserver(): Accessor<boolean> {
  const isVisible = () => document.visibilityState === 'visible';
  const [state, setState] = createSignal(isVisible());
  const callback = () => setState(isVisible());
  onMount(() => {
    document.addEventListener('visibilitychange', callback, false);
    onCleanup(() => document.removeEventListener('visibilitychange', callback, false));
  });
  return state;
}

export default createPageVisibilityObserver;
