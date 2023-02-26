import { Accessor, batch, createComputed, createSignal, untrack, $TRACK } from "solid-js";

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

export function createSwitchTransition<T>(
  source: Accessor<T>,
  options: SwitchTransitionOptions<NonNullable<T>>,
): Accessor<NonNullable<T>[]> {
  if (process.env.SSR) {
    let el: any = source();
    el = el ? [el] : [];
    return () => el;
  }

  // eslint-disable-next-line prefer-const
  let { onEnter = noopTransition, onExit = noopTransition } = options;

  // skip the first enter transition if appear is disabled
  let init = true;
  if (!options.appear) {
    const _onEnter = onEnter;
    onEnter = (el, done) => {
      onEnter = _onEnter;
      init ? done() : onEnter(el, done);
    };
  }

  const [returned, setReturned] = createSignal<NonNullable<T>[]>([]);

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

  createComputed((prev: T | undefined) => {
    const el = source();
    if (el !== prev) {
      next = el;
      untrack(() => batch(() => transition(prev)));
    }
    return el;
  });

  init = false;
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

export function createListTransition<T>(
  source: Accessor<readonly NonNullable<T>[]>,
  options: ListTransitionOptions<NonNullable<T>>,
): Accessor<NonNullable<T>[]> {
  if (process.env.SSR) {
    const copy = source().slice();
    return () => copy;
  }

  type V = NonNullable<T>;

  let { onChange } = options;

  // skip the first enter transition if appear is disabled
  let init = true;
  if (!options.appear) {
    const _onChange = onChange;
    onChange = data => {
      onChange = _onChange;
      init || onChange(data);
    };
  }

  const [returned, setReturned] = createSignal<V[]>([]);

  let prevSet: ReadonlySet<V> = new Set<V>();
  const exiting = new Set<V>();

  function finishRemoved(els: V[]): void {
    setReturned(p => p.filter(e => !els.includes(e)));
    for (const el of els) exiting.delete(el);
  }

  createComputed(() => {
    const list = source();
    (list as any)[$TRACK]; // top level store tracking

    untrack(() => {
      setReturned(prev => {
        const nextSet: ReadonlySet<V> = new Set(list);
        const next: V[] = list.slice();

        const added: V[] = [];
        const removed: V[] = [];
        const moved: V[] = [];

        for (const el of list) {
          (prevSet.has(el) ? moved : added).push(el);
        }

        for (let i = 0; i < prev.length; i++) {
          const el = prev[i]!;
          if (!nextSet.has(el)) {
            if (!exiting.has(el)) {
              removed.push(el);
              exiting.add(el);
            }
            next.splice(i, 0, el);
          }
        }

        onChange({ added, removed, moved, finishRemoved });

        prevSet = nextSet;
        return next;
      });
    });
  });

  init = false;
  return returned;
}
