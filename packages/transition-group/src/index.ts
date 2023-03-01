import {
  Accessor,
  batch,
  createSignal,
  untrack,
  $TRACK,
  createEffect,
  createComputed,
  createMemo,
  useTransition,
} from "solid-js";

const noop = () => {};
const noopTransition = (el: any, done: () => void) => done();

export type TransitionMode = "out-in" | "in-out" | "parallel";

export type OnTransition<T> = (el: T, done: () => void) => void;

export type SwitchTransitionOptions<T> = {
  onEnter?: OnTransition<T>;
  onExit?: OnTransition<T>;
  mode?: TransitionMode;
  appear?: boolean;
};

/**
 * Create an element transition interface for switching between single elements.
 * It can be used to implement own transition effect, or a custom `<Transition>`-like component.
 *
 * It will observe {@link source} and return a signal with array of elements to be rendered (current one and exiting ones).
 *
 * @param source a signal with the current element. Any nullish value will mean there is no element.
 * Any object can used as the source, but most likely you will want to use a `HTMLElement` or `SVGElement`.
 * @param options transition options:
 * - `onEnter` - a function to be called when a new element is entering. It receives the element and a callback to be called when the transition is done.
 * - `onExit` - a function to be called when an exiting element is leaving. It receives the element and a callback to be called when the transition is done.
 * - `mode` - transition mode. Defaults to `"parallel"`. Other options are `"out-in"` and `"in-out"`.
 * - `appear` - whether to run the transition on the initial element. Defaults to `false`.
 * @returns a signal with an array of the current element and exiting previous elements.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/transition-group#createSwitchTransition
 *
 * @example
 * const [el, setEl] = createSignal<HTMLDivElement>();
 *
 * const rendered = createSwitchTransition(el, {
 *   onEnter(el, done) {
 *     // the enter callback is called before the element is inserted into the DOM
 *     // so run the animation in the next animation frame
 *     requestAnimationFrame(() => { ... })
 *   },
 *   onExit(el, done) {
 *     // the exitting element is kept in the DOM until the done() callback is called
 *   },
 * })
 *
 * // change the source to trigger the transition
 * setEl(refToHtmlElement);
 */
export function createSwitchTransition<T>(
  source: Accessor<T>,
  options: SwitchTransitionOptions<NonNullable<T>>,
): Accessor<NonNullable<T>[]> {
  const initSource = untrack(source);
  const initReturned = initSource ? [initSource] : [];

  if (process.env.SSR) {
    return () => initReturned;
  }

  const { onEnter = noopTransition, onExit = noopTransition } = options;

  const [returned, setReturned] = createSignal<NonNullable<T>[]>(
    options.appear ? [] : initReturned,
  );
  const [transitions, setTransitions] = createSignal<VoidFunction[]>([], { equals: false });

  let next: T | undefined;
  let isExiting = false;

  function exitTransition(el: T | undefined, after?: () => void) {
    if (!el) return after && after();
    isExiting = true;
    setTransitions(
      p => (
        p.push(() =>
          onExit(el, () => {
            batch(() => {
              isExiting = false;
              setReturned(p => p.filter(e => e !== el));
              after && after();
            });
          }),
        ),
        p
      ),
    );
  }

  function enterTransition(after?: () => void) {
    const el = next;
    if (!el) return after && after();
    next = undefined;
    setReturned(p => [el, ...p]);
    setTransitions(p => (p.push(() => onEnter(el, after ?? noop)), p));
  }

  const triggerTransitions: (prev: T | undefined) => void =
    options.mode === "out-in"
      ? // exit -> enter
        prev => isExiting || exitTransition(prev, enterTransition)
      : options.mode === "in-out"
      ? // enter -> exit
        prev => enterTransition(() => exitTransition(prev))
      : // exit & enter
        prev => {
          enterTransition();
          exitTransition(prev);
        };

  // update returned array in a pure computation
  // so that the updated list is available in user effects
  createComputed(
    (prev: T | undefined) => {
      const el = source();

      if (el !== prev) {
        next = el;
        untrack(() => triggerTransitions(prev));
      }

      return el;
    },
    // enabling appear always animates the initial element in
    // otherwise the element won't be animated,
    // or will animate the transition if the source is different from the initial value
    options.appear ? undefined : initSource,
  );

  // call transitions in effect to suspend them under Suspense
  createEffect(() => {
    const queue = transitions();
    const copy = queue.slice();
    queue.length = 0;
    untrack(() => copy.forEach(cb => cb()));
  });

  return returned;
}

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

/**
 * Create an element list transition interface for changes to the list of elements.
 * It can be used to implement own transition effect, or a custom `<TransitionGroup>`-like component.
 *
 * It will observe {@link source} and return a signal with array of elements to be rendered (current ones and exiting ones).
 *
 * @param source a signal with the current list of elements.
 * Any object can used as the element, but most likely you will want to use a `HTMLElement` or `SVGElement`.
 * @param options transition options {@link ListTransitionOptions}
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/transition-group#createListTransition
 *
 * @example
 * const [els, setEls] = createSignal<HTMLElement[]>([]);
 *
 * const rendered = createListTransition(els, {
 *   onChange({ added, removed, moved, finishRemoved }) {
 *     // the callback is called before the added elements are inserted into the DOM
 *     // so run the animation in the next animation frame
 *     requestAnimationFrame(() => { ... })
 *
 *     // the removed elements are kept in the DOM until the finishRemoved() callback is called
 *     finishRemoved(removed);
 *   }
 * })
 *
 * // change the source to trigger the transition
 * setEls([...refsToHTMLElements]);
 */
export function createListTransition<T extends object>(
  source: Accessor<readonly T[]>,
  options: ListTransitionOptions<T>,
): Accessor<T[]> {
  const initSource = untrack(source);

  if (process.env.SSR) {
    const copy = initSource.slice();
    return () => copy;
  }

  const { onChange } = options;

  // if appear is enabled, the initial transition won't have any previous elements.
  // otherwise the elements will match and transition skipped, or transitioned if the source is different from the initial value
  let prevSet: ReadonlySet<T> = new Set(options.appear ? undefined : initSource);
  const exiting = new WeakSet<T>();

  const [toRemove, setToRemove] = createSignal<T[]>([], { equals: false });
  const [isTransitionPending] = useTransition();

  const finishRemoved: (els: T[]) => void =
    options.exitMethod === "remove"
      ? noop
      : els => {
          setToRemove(p => (p.push.apply(p, els), p));
          for (const el of els) exiting.delete(el);
        };

  const handleRemoved: (els: T[], el: T, i: number) => void =
    options.exitMethod === "remove"
      ? noop
      : options.exitMethod === "keep-index"
      ? (els, el, i) => els.splice(i, 0, el)
      : (els, el) => els.push(el);

  return createMemo(
    prev => {
      const elsToRemove = toRemove();
      const sourceList = source();
      (sourceList as any)[$TRACK]; // top level store tracking

      if (untrack(isTransitionPending)) {
        // wait for pending transition to end before animating
        isTransitionPending();
        return prev;
      }

      if (elsToRemove.length) {
        const next = prev.filter(e => !elsToRemove.includes(e));
        elsToRemove.length = 0;
        onChange({ list: next, added: [], removed: [], unchanged: next, finishRemoved });
        return next;
      }

      return untrack(() => {
        const nextSet: ReadonlySet<T> = new Set(sourceList);
        const next: T[] = sourceList.slice();

        const added: T[] = [];
        const removed: T[] = [];
        const unchanged: T[] = [];

        for (const el of sourceList) {
          (prevSet.has(el) ? unchanged : added).push(el);
        }

        let nothingChanged = !added.length;
        for (let i = 0; i < prev.length; i++) {
          const el = prev[i]!;
          if (!nextSet.has(el)) {
            if (!exiting.has(el)) {
              removed.push(el);
              exiting.add(el);
            }
            handleRemoved(next, el, i);
          }
          if (nothingChanged && el !== next[i]) nothingChanged = false;
        }

        // skip if nothing changed
        if (!removed.length && nothingChanged) return prev;

        onChange({ list: next, added, removed, unchanged, finishRemoved });

        prevSet = nextSet;
        return next;
      });
    },
    options.appear ? [] : initSource.slice(),
  );
}
