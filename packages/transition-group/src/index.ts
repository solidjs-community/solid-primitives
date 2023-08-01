import {
  Accessor,
  batch,
  createSignal,
  untrack,
  $TRACK,
  createComputed,
  useTransition,
} from "solid-js";
import { isServer } from "solid-js/web";
import { arrayEquals, makeSetItem, trackTransitionPending } from "./utils";

const noop = () => {};
const noopAsync = async () => {};
const noopTransition = (el: any, done: () => void) => done();

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

/**
 * Create an element transition interface for switching between single elements.
 * It can be used to implement own transition effect, or a custom `<Transition>`-like component.
 *
 * It will observe {@link source} and return a signal with array of elements to be rendered (current one and exiting ones).
 *
 * @param source a signal with the current element. Any nullish value will mean there is no element.
 * Any object can used as the source, but most likely you will want to use a `HTMLElement` or `SVGElement`.
 * @param options transition options {@link SwitchTransitionOptions}
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
 *     // so run the animation in the next animation frame / microtask
 *     queueMicrotask(() => { ... })
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

  if (isServer) {
    return () => initReturned;
  }

  const { onEnter = noopTransition, onExit = noopTransition } = options;

  const [returned, setReturned] = createSignal<NonNullable<T>[]>(
    options.appear ? [] : initReturned,
  );
  const [isTransitionPending] = useTransition();

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

  createComputed(
    (prev: T | undefined) => {
      const el = source();

      if (untrack(isTransitionPending)) {
        // wait for pending transition to end before animating
        isTransitionPending();
        return prev;
      }

      if (el !== prev) {
        next = el;
        batch(() => untrack(() => triggerTransitions(prev)));
      }

      return el;
    },
    options.appear ? undefined : initSource,
  );

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

export type InterruptMethod = "cancel" | "wait" | "none";

export type ListTransitionOptions = {
  /** whether to run the transition on the initial elements. Defaults to `false` */
  appear?: boolean;
  /**
   * This controls what happens when a transition is interrupted. This can happen when an element exits before an enter transition has completed, or vice versa. {@link InterruptMethod}
   * - `"cancel"` (default) abandons the current transition and starts the interrupting one as soon as it happens.
   * - `"wait"` waits for the current transition to complete before starting the most recently interrupting transition.
   * - `"none"` ignores the interrupting transition entirely
   */
  interruptMethod?: InterruptMethod;
  /**
   * This controls how the elements exit. {@link ExitMethod}
   * - `"remove"` removes the element immediately.
   * - `"move-to-end"` (default) will move elements which have exited to the end of the array.
   * - `"keep-index"` will splice them in at their previous index.
   */
  exitMethod?: ExitMethod;
};

type TransitionItemState = "initial" | "entering" | "entered" | "exiting" | "exited";

type TransitionCallback = () => () => Promise<unknown>;

type TransitionControl = () => () => Promise<void>;

type TransitionItemContext = {
  state: Accessor<TransitionItemState>;
  useEnter(callback: TransitionCallback): void;
  useExit(callback: TransitionCallback): void;
  useRemain(callback: TransitionCallback): void;
};

type TransitionItemControls = {
  enter: TransitionControl;
  exit: TransitionControl;
  remain: TransitionControl;
};

type TransitionItem<T> = [T, TransitionItemContext, TransitionItemControls];

class TransitionInterruptError extends Error {
  static ignore(error: any) {
    if (!(error instanceof TransitionInterruptError)) {
      throw error;
    }
  }
}

function createTransitionItem<T>(el: T, options: ListTransitionOptions): TransitionItem<T> {
  const [state, setState] = createSignal<TransitionItemState>("initial");
  const cancelSet = new Set<() => void>();
  const enterCallbacks = new Set<TransitionCallback>();
  const exitCallbacks = new Set<TransitionCallback>();
  const remainCallbacks = new Set<TransitionCallback>();
  let controlIsRunning: boolean = false;

  const makeTransitionControl: (
    callbackSet: Set<TransitionCallback>,
    startState: TransitionItemState,
    endState: TransitionItemState,
  ) => TransitionControl =
    options.interruptMethod === "none"
      ? (callbackSet, startState, endState) => () => {
          if (controlIsRunning) {
            return noopAsync;
          }

          controlIsRunning = true;

          const callbacks = Array.from(callbackSet).map(callback => callback());
          setState(startState);

          return () =>
            Promise.all(callbacks.map(callback => callback()))
              .then(() => {
                setState(endState);
              })
              .finally(() => {
                controlIsRunning = false;
              });
        }
      : (callbackSet, startState, endState) => () => {
          for (const cancel of cancelSet) {
            cancel();
          }

          let cancel: () => void;

          const cancelPromise = new Promise((_, reject) => {
            cancel = () => {
              reject(new TransitionInterruptError());
            };
            cancelSet.add(cancel);
          });

          const callbacks = Array.from(callbackSet).map(callback => callback());

          setState(startState);

          return () =>
            Promise.race([Promise.all(callbacks.map(callback => callback())), cancelPromise])
              .then(() => {
                setState(endState);
              })
              .finally(() => {
                cancelSet.delete(cancel);
              });
        };

  return [
    el,
    {
      state,
      useEnter(callback: TransitionCallback) {
        makeSetItem(enterCallbacks, callback);
      },
      useExit(callback: TransitionCallback) {
        makeSetItem(exitCallbacks, callback);
      },
      useRemain(callback: TransitionCallback) {
        makeSetItem(remainCallbacks, callback);
      },
    },
    {
      enter: makeTransitionControl(enterCallbacks, "entering", "entered"),
      exit: makeTransitionControl(exitCallbacks, "exiting", "exited"),
      remain() {
        return () =>
          Promise.all(Array.from(remainCallbacks).map(callback => callback()())).then(noop);
      },
    },
  ];
}

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
 *   onChange({ list, added, removed, unchanged, finishRemoved }) {
 *     // the callback is called before the added elements are inserted into the DOM
 *     // so run the animation in the next animation frame / microtask
 *     queueMicrotask(() => { ... })
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
  options: ListTransitionOptions,
): Accessor<[T, TransitionItemContext][]> {
  const initSource = untrack(source);

  if (isServer) {
    const copy = initSource.slice().map<[T, TransitionItemContext]>(item => [
      item,
      {
        state: () => "initial",
        useEnter() {},
        useExit() {},
        useRemain() {},
      },
    ]);
    return () => copy;
  }

  // if appear is enabled, the initial transition won't have any previous elements.
  // otherwise the elements will match and transition skipped, or transitioned if the source is different from the initial value
  let prevSet: ReadonlySet<T> = new Set(options.appear ? undefined : initSource);

  const [result, setResult] = createSignal<TransitionItem<T>[]>(
    options.appear ? [] : initSource.slice().map(el => createTransitionItem(el, options)),
    { equals: arrayEquals },
  );

  const [toRemove, setToRemove] = createSignal<T[]>([], { equals: false });

  const [isTransitionPending] = useTransition();

  const finishRemoved: (el: T) => void =
    options.exitMethod === "remove"
      ? noop
      : el => {
          setToRemove(p => [...p, el]);
        };

  const handleExiting: (items: TransitionItem<T>[], item: TransitionItem<T>, i: number) => void =
    options.exitMethod === "remove"
      ? noop
      : options.exitMethod === "keep-index"
      ? (items, item, i) => items.splice(i, 0, item)
      : (items, item) => items.push(item);

  createComputed(() => {
    console.log("computed");
    const sourceList = source();
    const elsToRemove = toRemove();
    (sourceList as any)[$TRACK]; // top level store tracking

    trackTransitionPending(isTransitionPending, () => {
      untrack(() => {
        const prev = result();

        if (elsToRemove.length) {
          console.log("elsToRemove", elsToRemove);
          const next = prev.filter(([el]) => !elsToRemove.includes(el));
          elsToRemove.length = 0;
          setResult(next);
          return;
        }

        const nextSet: ReadonlySet<T> = new Set(sourceList);
        const next: TransitionItem<T>[] = [];
        const entering: TransitionItem<T>[] = [];
        const exiting: TransitionItem<T>[] = [];
        const remaining: TransitionItem<T>[] = [];

        for (let i = 0; i < sourceList.length; i++) {
          const el = sourceList[i]!;
          if (prevSet.has(el)) {
            const item = prev.find(([prevEl]) => prevEl === el)!;
            next.push(item);
            remaining.push(item);
          } else {
            console.log("add", el);
            const item = createTransitionItem(el, options);
            next.push(item);
            entering.push(item);
          }
        }

        for (let i = 0; i < prev.length; i++) {
          const item = prev[i]!;
          const [el] = item;
          if (!nextSet.has(el)) {
            handleExiting(next, item, i);
            if (prevSet.has(el)) {
              console.log("remove", el);
              exiting.push(item);
            }
          }
        }

        prevSet = nextSet;
        setResult(next);

        queueMicrotask(() => {
          const callbacks: Array<() => Promise<void>> = [];

          for (let i = 0; i < exiting.length; i++) {
            const [el, , controls] = exiting[i]!;
            const callback = controls.exit();
            callbacks.push(() =>
              callback().then(() => {
                finishRemoved(el);
              }),
            );
          }

          for (let i = 0; i < entering.length; i++) {
            const [, , controls] = entering[i]!;
            callbacks.push(controls.enter());
          }

          for (let i = 0; i < remaining.length; i++) {
            const [, , controls] = remaining[i]!;
            callbacks.push(controls.remain());
          }

          for (let i = 0; i < callbacks.length; i++) {
            callbacks[i]?.().catch(TransitionInterruptError.ignore);
          }
        });
      });
    });
  });

  return result as unknown as Accessor<[T, TransitionItemContext][]>;
}
