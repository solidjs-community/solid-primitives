import { createMicrotask, falseFn, noop } from "@solid-primitives/utils";
import { Accessor, Signal, batch, createMemo, createSignal, untrack } from "solid-js";
import { isServer } from "solid-js/web";

const untracked =
  <T>(fn: () => T): (() => T) =>
  () =>
    untrack(fn);

/**
 * Configuration object for {@link createUndoHistory}.
 */
export type UndoHistoryOptions = {
  /**
   * The maximum number of undo steps to keep in memory.
   * @default 100
   */
  limit?: number;
};

/**
 * Return type of {@link createUndoHistory}.
 */
export type UndoHistoryReturn = {
  /**
   * @returns `true` if an undo step is available, `false` otherwise.
   *
   * @see {@link UndoHistoryReturn.undo}
   *
   * This accessor is not memoized and should be used in a {@link createMemo} to ensure it.
   */
  getCanUndo: Accessor<boolean>;
  /**
   * @returns `true` if an redo step is available, `false` otherwise.
   *
   * @see {@link UndoHistoryReturn.redo}
   *
   * This accessor is not memoized and should be used in a {@link createMemo} to ensure it.
   */
  getCanRedo: Accessor<boolean>;
  /**
   * Undo the last step. Does nothing if {@link UndoHistoryReturn.getCanUndo} is `false`.
   *
   * It calls the callback returned from the {@link createUndoHistory} source.
   */
  undo: VoidFunction;
  /**
   * Redo the last step. Does nothing if {@link UndoHistoryReturn.getCanRedo} is `false`.
   *
   * It calls the callback returned from the {@link createUndoHistory} source.
   */
  redo: VoidFunction;
};

export function createUndoHistory(
  source: Accessor<VoidFunction>,
  options?: UndoHistoryOptions,
): UndoHistoryReturn {
  if (isServer) {
    return {
      getCanUndo: falseFn,
      getCanRedo: falseFn,
      undo: noop,
      redo: noop,
    };
  }

  let ignoreNext = false;

  // +1 to account for the current state
  const limit = (options?.limit ?? 100) + 1,
    history: VoidFunction[] = [],
    clearIgnore = createMicrotask(() => (ignoreNext = false)),
    memo = createMemo<{ count: Signal<number> }>(
      p => {
        const setter = source();

        if (ignoreNext) {
          ignoreNext = false;
          return p;
        }

        const count = untrack(p.count[0]);

        history.splice(history.length - count, count, setter);

        if (history.length > limit) {
          history.splice(0, history.length - limit);
        }

        return { count: count ? createSignal(0) : p.count };
      },
      { count: createSignal(0) },
    ),
    getCanUndo = () => {
      // access memo first to ensure history is up to date
      const { count } = memo();
      return history.length - count[0]() > 1;
    },
    getCanRedo = () => memo().count[0]() > 0,
    move = (n: -1 | 1) => {
      ignoreNext = true;
      clearIgnore();
      batch(() => history[history.length - memo().count[1](p => p + n) - 1]!());
    };

  return {
    getCanUndo,
    getCanRedo,
    undo: untracked(() => getCanUndo() && move(1)),
    redo: untracked(() => getCanRedo() && move(-1)),
  };
}
