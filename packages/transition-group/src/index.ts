import { Accessor, batch, createSignal, untrack, $TRACK, createEffect } from "solid-js";

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
  let { appear } = options;

  const [returned, setReturned] = createSignal<NonNullable<T>[]>(initReturned);

  let next: T | undefined;
  let isExiting = false;

  function exitTransition(el: T | undefined, after?: () => void) {
    if (!el) return after && after();
    isExiting = true;
    onExit(el, () => {
      batch(() => {
        isExiting = false;
        setReturned(p => p.filter(e => e !== el));
        after && after();
      });
    });
  }

  function enterTransition(after?: () => void) {
    const el = next;
    if (!el) return after && after();
    next = undefined;
    setReturned(p => [el, ...p]);
    onEnter(el, after ?? noop);
  }

  const transition: (prev: T | undefined) => void =
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

  // update elements and call transitions in effect to suspend under Suspense
  createEffect(
    (prev: T | undefined) => {
      const el = source();

      if (appear) {
        appear = false;
        // the initial element is already in the rendered array
        // so it needs to be removed to be added again during the enter transition
        setReturned([]);
      }

      if (el !== prev) {
        next = el;
        untrack(() => transition(prev));
      }

      return el;
    },
    // enabling appear always animates the initial element in
    // otherwise the element won't be animated,
    // or will animate the transition if the source is different from the initial value
    appear ? undefined : initSource,
  );

  return returned;
}

export type OnListChange<T> = (payload: {
  added: T[];
  removed: T[];
  moved: T[];
  finishRemoved: (els: T[]) => void;
}) => void;

export type ListTransitionOptions<T> = {
  onChange: OnListChange<T>;
  appear?: boolean;
};

/**
 * Create an element list transition interface for changes to the list of elements.
 * It can be used to implement own transition effect, or a custom `<TransitionGroup>`-like component.
 *
 * It will observe {@link source} and return a signal with array of elements to be rendered (current ones and exiting ones).
 *
 * @param source a signal with the current list of elements.
 * Any object can used as the element, but most likely you will want to use a `HTMLElement` or `SVGElement`.
 * @param options transition options:
 * - `onChange` - a function to be called when the list changes. It receives the list of added elements, removed elements, and moved elements. It also receives a callback to be called when the removed elements are finished animating (they can be removed from the DOM).
 * - `appear` - whether to run the transition on the initial elements. Defaults to `false`.
 * @returns a signal with an array of the current elements and exiting previous elements.
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
export function createListTransition<T>(
  source: Accessor<readonly NonNullable<T>[]>,
  options: ListTransitionOptions<NonNullable<T>>,
): Accessor<NonNullable<T>[]> {
  type V = NonNullable<T>;

  const initSource = untrack(source).slice();

  if (process.env.SSR) {
    return () => initSource;
  }

  const { onChange } = options;
  let { appear } = options;

  const [returned, setReturned] = createSignal<V[]>(initSource);

  // if appear is enabled, the initial transition won't have any previous elements.
  // otherwise the elements will match and transition skipped, or transitioned if the source is different from the initial value
  let prevSet: ReadonlySet<V> = new Set(appear ? undefined : initSource);
  const exiting = new Set<V>();

  function finishRemoved(els: V[]): void {
    setReturned(p => p.filter(e => !els.includes(e)));
    for (const el of els) exiting.delete(el);
  }

  // update elements and call transitions in effect to suspend under Suspense
  createEffect(() => {
    const list = source();
    (list as any)[$TRACK]; // top level store tracking

    if (appear) {
      appear = false;
      // the initial element is already in the rendered array
      // so it needs to be removed to be added again during the enter transition
      setReturned([]);
    }

    untrack(() =>
      setReturned(prev => {
        const nextSet: ReadonlySet<V> = new Set(list);
        const next: V[] = list.slice();

        const added: V[] = [];
        const removed: V[] = [];
        const moved: V[] = [];

        for (const el of list) {
          (prevSet.has(el) ? moved : added).push(el);
        }

        let sameOrder = true;
        for (let i = 0; i < prev.length; i++) {
          const el = prev[i]!;
          if (!nextSet.has(el)) {
            if (!exiting.has(el)) {
              removed.push(el);
              exiting.add(el);
            }
            next.splice(i, 0, el);
          }
          if (sameOrder && el !== next[i]) sameOrder = false;
        }

        // skip if nothing changed
        if (!added.length && !removed.length && sameOrder) return prev;

        onChange({ added, removed, moved, finishRemoved });

        prevSet = nextSet;
        return next;
      }),
    );
  });

  return returned;
}
