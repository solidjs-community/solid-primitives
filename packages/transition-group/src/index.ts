import { FalsyValue, noop } from "@solid-primitives/utils";
import { Accessor, batch, createComputed, createSignal, untrack } from "solid-js";

const logEl = (el: any) => (el ? el.textContent : null);

const noopTransition = (el: any, done: () => void) => done();

export function createSwitchTransition<T extends object>(
  source: Accessor<T | FalsyValue>,
  props: {
    onEnter?: (el: T, done: () => void) => void;
    onExit?: (el: T, done: () => void) => void;
    mode?: "out-in" | "in-out" | "parallel";
    appear?: boolean;
  },
): Accessor<T[]> {
  if (process.env.SSR) {
    let el: any = source();
    el = el ? [el] : [];
    return () => el;
  }

  // eslint-disable-next-line prefer-const
  let { onEnter = noopTransition, onExit = noopTransition } = props;

  // prevent the first enter transition if appear is disabled
  let init = true;
  if (!props.appear) {
    const _onEnter = onEnter;
    onEnter = (el, done) => {
      onEnter = _onEnter;
      init ? done() : onEnter(el, done);
    };
  }

  const [returned, setReturned] = createSignal<T[]>([]);

  let next: T | undefined;
  let isExiting = false;

  function exitTransition(el: T | undefined, after?: () => void) {
    if (!el) return after?.();
    isExiting = true;
    onExit(el, () => {
      batch(() => {
        isExiting = false;
        setReturned(p => p.filter(e => e !== el));
        after?.();
      });
    });
  }

  function enterTransition(after?: () => void) {
    const el = next;
    if (!el) return after?.();
    next = undefined;
    setReturned(p => [el, ...p]);
    onEnter(el, after ?? noop);
  }

  const transition: (prev: T | undefined) => void =
    props.mode === "out-in"
      ? // exit -> enter
        prev => isExiting || exitTransition(prev, enterTransition)
      : props.mode === "in-out"
      ? // enter -> exit
        prev => enterTransition(() => exitTransition(prev))
      : // exit & enter
        prev => {
          enterTransition();
          exitTransition(prev);
        };

  createComputed((prev: T | undefined) => {
    const el = source() || undefined;
    if (el !== prev) {
      next = el;
      untrack(() => batch(() => transition(prev)));
    }
    return el;
  });

  init = false;
  return returned;
}
