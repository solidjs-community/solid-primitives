import { type Many, falseFn, noop } from "@solid-primitives/utils";
import { type Accessor, createMemo, createOptimistic, createStore, untrack } from "solid-js";
import { isServer } from "@solidjs/web";

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

// One slot per source, always the same length as `sources` — even when a
// source is paused (returns falsy) it keeps its `undefined` slot instead of
// being dropped, so entries never end up with mismatched lengths and index i
// always refers to the same source across every recorded entry.
type Setters = (VoidFunction | undefined)[];

type HistoryState = { offset: number; items: Setters[] };

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
  source: Many<Accessor<VoidFunction | false | undefined | null | void>>,
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

  const limit = options?.limit ?? 100,
    // Each source gets its own memo so an unrelated source's recompute
    // doesn't produce a fresh (reference-unequal) closure for this one —
    // that reference stability is what lets `jump` skip no-op restores.
    sources = (Array.isArray(source) ? source : [source]).map(s => createMemo(s)),
    [disableTracking, setDisableTracking] = createOptimistic(false),
    [store, setStore] = createStore<HistoryState>(
      draft => {
        const setters: Setters = sources.map(s => s() || undefined);
        if (untrack(disableTracking) || setters.every(s => s === undefined)) return;

        // drop any redo-only tail (entries beyond the current position),
        // insert the new entry, then trim to at most `limit` past entries.
        draft.items.splice(draft.items.length - draft.offset, draft.offset, setters);
        draft.items.splice(0, draft.items.length - (limit + 1));
        draft.offset = 0;
      },
      { offset: 0, items: [] },
    ),
    getTargetIndex = (state: HistoryState, amount: number) => {
      const target = state.items.length - 1 - (state.offset - amount);
      return target >= 0 && target < state.items.length ? target : null;
    },
    jump = (amount: -1 | 1) => {
      setDisableTracking(true);
      let toEntry: Setters | undefined, fromEntry: Setters | undefined;
      setStore(draft => {
        const targetIndex = getTargetIndex(draft, amount);
        if (targetIndex === null) return;
        toEntry = draft.items[targetIndex];
        fromEntry = draft.items[targetIndex - amount];
        draft.offset -= amount;
      });
      if (!toEntry || !fromEntry) return;
      const setters = toEntry,
        prevSetters = fromEntry;
      untrack(() => {
        for (let i = 0; i < setters.length; i++) {
          // only call the setter if it was active on both sides of the move
          // and the value actually differs — if a source was paused on
          // either side we have no tracked value to compare against, so
          // skip it rather than firing a spurious restore
          const setter = setters[i],
            prevSetter = prevSetters[i];
          if (setter !== undefined && prevSetter !== undefined && setter !== prevSetter) setter();
        }
      });
    };

  return {
    canUndo: () => getTargetIndex(store, -1) !== null,
    canRedo: () => getTargetIndex(store, 1) !== null,
    undo() {
      jump(-1);
    },
    redo() {
      jump(1);
    },
  };
}
