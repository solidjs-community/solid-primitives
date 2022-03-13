import { Accessor } from "solid-js";

/**
 * Create a visibility observer is a helper primitive for tracking when the page is visible.
 *
 * @return Returns a signel with a boolean value identifying the visibility state.
 *
 */
const createPageVisibilityObserver = (): Accessor<boolean> => {
  return () => true;
};

export default createPageVisibilityObserver;
