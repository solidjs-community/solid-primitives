import {
  Accessor,
  batch,
  createSignal,
  untrack,
  $TRACK,
  createComputed,
  createMemo,
  useTransition,
  onCleanup,
  createRoot,
  Setter,
  createEffect,
  getOwner,
  runWithOwner,
} from "solid-js";
import { isServer } from "solid-js/web";

const noop = () => {};
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

export type ListTransitionOptions = {
  /** whether to run the transition on the initial elements. Defaults to `false` */
  appear?: boolean;
  cancellable?: boolean;
  /**
   * This controls how the elements exit. {@link ExitMethod}
   * - `"remove"` removes the element immediately.
   * - `"move-to-end"` (default) will move elements which have exited to the end of the array.
   * - `"keep-index"` will splice them in at their previous index.
   */
  exitMethod?: ExitMethod;
};

type TransitionState = "initial" | "entering" | "entered" | "exiting" | "exited";

type TransitionCallback = (done: () => void) => void;

type TransitionItem = {
  state: Accessor<TransitionState>;
  useOnEnter(callback: TransitionCallback): void;
  useOnExit(callback: TransitionCallback): void;
  useOnRemain(callback: () => void): void;
};

type TransitionItemControls = {
  enter(): Promise<void>;
  exit(): Promise<void>;
  remain(): void;
};

function makeSetItem<T>(set: Set<T>, item: T) {
  set.add(item);
  onCleanup(() => {
    set.delete(item);
  });
}

function allCallbacks(set: Set<TransitionCallback>): Promise<unknown> {
  return Promise.all(
    Array.from(set.values()).map(callback => new Promise<void>(resolve => callback(resolve))),
  );
}

function makeTransitionControl(
  callbacks: Set<TransitionCallback>,
  getDispose: Accessor<(() => void) | undefined>,
  setDispose: Setter<(() => void) | undefined>,
  onStart: () => void,
  onEnd: () => void,
): () => Promise<void> {
  return () => {
    getDispose()?.();
    onStart();
    return createRoot(async dispose => {
      setDispose(() => dispose);
      onCleanup(() => {
        setDispose(undefined);
      });
      await allCallbacks(callbacks);
      onEnd();
    });
  };
}

function createTransitionItem(): [TransitionItem, TransitionItemControls] {
  const [state, setState] = createSignal<TransitionState>("initial");
  const [getDispose, setDispose] = createSignal<() => void>();

  const enterCallbacks = new Set<TransitionCallback>();
  const exitCallbacks = new Set<TransitionCallback>();

  return [
    {
      state,
      useOnEnter(callback: TransitionCallback) {
        makeSetItem(enterCallbacks, callback);
      },
      useOnExit(callback: TransitionCallback) {
        makeSetItem(exitCallbacks, callback);
      },
      useOnRemain(callback: () => void) {},
    },
    {
      enter: makeTransitionControl(
        enterCallbacks,
        getDispose,
        setDispose,
        () => {
          setState("entering");
        },
        () => {
          setState("entered");
        },
      ),
      exit: makeTransitionControl(
        exitCallbacks,
        getDispose,
        setDispose,
        () => {
          setState("exiting");
        },
        () => {
          setState("exited");
        },
      ),
      remain() {},
    },
  ];
}

function arrayEquals<T extends Array<unknown>>(a: T, b: T): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function trackTransitionPending(isPending: Accessor<boolean>, callback: () => void): void {
  if (untrack(isPending)) {
    isPending();
    return;
  } else {
    callback();
  }
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
): Accessor<[T, TransitionItem][]> {
  const initSource = untrack(source);

  if (isServer) {
    const copy = initSource.slice().map(
      item =>
        [
          item,
          {
            state: () => "initial",
            useOnEnter() {},
            useOnExit() {},
            useOnRemain() {},
          },
        ] as [T, TransitionItem],
    );
    return () => copy;
  }

  // if appear is enabled, the initial transition won't have any previous elements.
  // otherwise the elements will match and transition skipped, or transitioned if the source is different from the initial value
  let prevSet: ReadonlySet<T> = new Set(options.appear ? undefined : initSource);

  const [result, setResult] = createSignal<[T, TransitionItem, TransitionItemControls][]>(
    options.appear ? [] : initSource.slice().map(item => [item, ...createTransitionItem()]),
    { equals: arrayEquals },
  );

  const [isTransitionPending] = useTransition();

  const finishRemoved: (el: T) => void =
    options.exitMethod === "remove"
      ? noop
      : el => {
          setResult(prev => prev.filter(([prevEl]) => prevEl !== el));
        };

  const handleExiting: (
    els: [T, TransitionItem, TransitionItemControls][],
    el: [T, TransitionItem, TransitionItemControls],
    i: number,
  ) => void =
    options.exitMethod === "remove"
      ? noop
      : options.exitMethod === "keep-index"
      ? (els, el, i) => els.splice(i, 0, el)
      : (els, el) => els.push(el);

  const owner = getOwner();

  createComputed(() => {
    const sourceList = source();
    (sourceList as any)[$TRACK]; // top level store tracking

    trackTransitionPending(isTransitionPending, () => {
      untrack(() => {
        const prev = result();
        const nextSet: ReadonlySet<T> = new Set(sourceList);
        const next: [T, TransitionItem, TransitionItemControls][] = [];

        for (let i = 0; i < sourceList.length; i++) {
          const el = sourceList[i]!;
          if (prevSet.has(el)) {
            const tuple = prev.find(([prevEl]) => prevEl === el)!;
            next.push(tuple);
            const [, , controls] = tuple;
            controls.remain();
          } else {
            console.log("add", el);
            const [item, controls] = createTransitionItem();
            next.push([el, item, controls]);
            queueMicrotask(() => {
              controls.enter();
            });
          }
        }

        for (let i = 0; i < prev.length; i++) {
          const tuple = prev[i]!;
          const [el, , controls] = tuple;
          if (!nextSet.has(el)) {
            handleExiting(next, tuple, i);
            if (prevSet.has(el)) {
              console.log("remove");
              controls.exit().then(() => {
                runWithOwner(owner, () => {
                  createComputed(() => {
                    trackTransitionPending(isTransitionPending, () => {
                      finishRemoved(el);
                    });
                  });
                });
              });
            }
          }
        }

        prevSet = nextSet;
        setResult(next);
      });
    });
  });

  return result as unknown as Accessor<[T, TransitionItem][]>;
}
