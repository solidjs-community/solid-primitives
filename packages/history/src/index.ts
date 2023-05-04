import { Many, createMicrotask, falseFn, noop } from "@solid-primitives/utils";
import { Accessor, Signal, batch, createMemo, createSignal, untrack } from "solid-js";
import { isServer } from "solid-js/web";

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
   */
  canUndo: Accessor<boolean>;
  /**
   * @returns `true` if an redo step is available, `false` otherwise.
   *
   * @see {@link UndoHistoryReturn.redo}
   */
  canRedo: Accessor<boolean>;
  /**
   * Undo the last step. Does nothing if {@link UndoHistoryReturn.canUndo} is `false`.
   *
   * It calls the callback returned from the {@link createUndoHistory} source.
   */
  undo: VoidFunction;
  /**
   * Redo the last step. Does nothing if {@link UndoHistoryReturn.canRedo} is `false`.
   *
   * It calls the callback returned from the {@link createUndoHistory} source.
   */
  redo: VoidFunction;
};

export function createUndoHistory(
  source: Many<Accessor<VoidFunction>>,
  options?: UndoHistoryOptions,
): UndoHistoryReturn {
  if (isServer) {
    return {
      canUndo: falseFn,
      canRedo: falseFn,
      undo: noop,
      redo: noop,
    };
  }

  let ignoreNext = false;

  const limit = options?.limit ?? 100,
    sources = Array.isArray(source) ? source.map(s => createMemo(s)) : [source],
    clearIgnore = createMicrotask(() => (ignoreNext = false)),
    history = createMemo<{ count: Signal<number>; list: VoidFunction[][] }>(
      p => {
        // always track the sources
        const setters = sources.map(s => s());

        if (ignoreNext) {
          ignoreNext = false;
          return p;
        }

        const count = untrack(p.count[0]),
          newLength = p.list.length - count,
          newHistory = p.list.slice(Math.max(0, newLength - limit), newLength);
        newHistory.push(setters);

        return { count: count ? createSignal(0) : p.count, list: newHistory };
      },
      { list: [], count: createSignal(0) },
    ),
    canUndo = createMemo(() => {
      const h = history();
      return h.list.length - h.count[0]() > 1;
    }),
    canRedo = createMemo(() => history().count[0]() > 0),
    move = (n: -1 | 1) => {
      ignoreNext = true;
      clearIgnore();
      const h = history(),
        newCount = h.count[1](p => p + n),
        newIndex = h.list.length - newCount - 1,
        prevSetters = h.list[newIndex + n]!,
        setters = h.list[newIndex]!;
      for (let i = 0; i < setters.length; i++) {
        // only call the setter if the current value is different
        if (setters[i] !== prevSetters[i]) setters[i]!();
      }
    };

  return {
    canUndo,
    canRedo,
    undo: () => untrack(() => canUndo() && batch(() => move(1))),
    redo: () => untrack(() => canRedo() && batch(() => move(-1))),
  };
}
