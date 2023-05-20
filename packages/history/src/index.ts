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

/**
 * Creates an undo history from a reactive source for going back and forth between state snapshots.
 *
 * @param source A function or an array thereof that tracks the state to be restored, and returns a callback to restore it.
 * @param options Configuration object. See {@link UndoHistoryOptions}.
 * @returns An object for interacting with the undo history. See {@link UndoHistoryReturn}.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/history#createUndoHistory
 *
 * @example
 * ```ts
 * const [count, setCount] = createSignal(0);
 *
 * const history = createUndoHistory(() => {
 *   // track the changes to the state (and clone if you need to)
 *   const v = count();
 *   // return a callback to set the state back to the tracked value
 *   return () => setCount(v);
 * });
 *
 * // undo the last change
 * history.undo();
 *
 * // redo the last change
 * history.redo();
 * ```
 */
export function createUndoHistory(
  source: Many<Accessor<VoidFunction | false | undefined | null>>,
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
        const setters: VoidFunction[] = [];
        for (const s of sources) {
          const setter = s();
          if (setter) setters.push(setter);
        }

        if (ignoreNext || !setters.length) {
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
    undo() {
      untrack(() => canUndo() && batch(() => move(1)));
    },
    redo() {
      untrack(() => canRedo() && batch(() => move(-1)));
    },
  };
}
