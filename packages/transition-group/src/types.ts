export type TransitionMode = "out-in" | "in-out" | "parallel";

export type OnTransition<T> = (el: T, done: () => void) => void;

export type SwitchTransitionOptions<T> = {
  /**
   * a function to be called when a new element is entering. {@link OnTransition}
   *
   * It receives the element and a callback to be called when the transition is done.
   */
  onEnter?: OnTransition<T>;
  /**
   * a function to be called when an exiting element is leaving. {@link OnTransition}
   *
   * It receives the element and a callback to be called when the transition is done.
   * The element is kept in the DOM until the done() callback is called.
   */
  onExit?: OnTransition<T>;
  /**
   * transition mode. {@link TransitionMode}
   *
   * Defaults to `"parallel"`. Other options are `"out-in"` and `"in-out"`.
   */
  mode?: TransitionMode;
  /** whether to run the transition on the initial elements. Defaults to `false` */
  appear?: boolean;
};

export type OnListChange<T> = (payload: {
  /** full list of elements to be rendered */
  list: T[];
  /** list of elements that were added since the last change */
  added: T[];
  /** list of elements that were removed since the last change */
  removed: T[];
  /** list of elements that were already added before, and are not currently exiting */
  unchanged: T[];
  /** Callback for finishing the transition of exiting elements - removes them from rendered array */
  finishRemoved: (els: T[]) => void;
}) => void;

export type ExitMethod = "remove" | "move-to-end" | "keep-index";

export type ListTransitionOptions<T> = {
  /**
   * A function to be called when the list changes. {@link OnListChange}
   *
   * It receives the list of current, added, removed, and unchanged elements.
   * It also receives a callback to be called when the removed elements are finished animating (they can be removed from the DOM).
   */
  onChange: OnListChange<T>;
  /** whether to run the transition on the initial elements. Defaults to `false` */
  appear?: boolean;
  /**
   * This controls how the elements exit. {@link ExitMethod}
   * - `"remove"` removes the element immediately.
   * - `"move-to-end"` (default) will move elements which have exited to the end of the array.
   * - `"keep-index"` will splice them in at their previous index.
   */
  exitMethod?: ExitMethod;
};
