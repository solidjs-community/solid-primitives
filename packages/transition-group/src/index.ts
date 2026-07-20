import {
  type Accessor,
  createSignal,
  createMemo,
  createRenderEffect,
  untrack,
  $TRACK,
} from "solid-js";
import { isServer } from "@solidjs/web";
import { noop } from "@solid-primitives/utils";
import type { ListTransitionOptions, SwitchTransitionOptions } from "./types.ts";

export type * from "./types.ts";

const noopTransition = (_el: any, done: () => void) => done();

const VERSION_SIGNAL_OPTS = { equals: false, ownedWrite: true } as const;

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

  // The list is maintained in a plain closure variable (synchronous mutations) and
  // a version counter signal. The version signal marks the memo stale immediately
  // when written, so the memo recomputes synchronously on the next read — even
  // inside a user effect running in the same flush cycle.
  let currentList: NonNullable<T>[] = options.appear ? [] : initReturned.slice();
  const [listVersion, bumpVersion] = createSignal(0, VERSION_SIGNAL_OPTS);

  function updateList(fn: (prev: NonNullable<T>[]) => NonNullable<T>[]) {
    currentList = fn(currentList);
    bumpVersion(v => v + 1);
  }

  let next: T | undefined;
  let isExiting = false;
  // Pre-seeded with initSource so the first render-effect run skips the transition
  // when appear is false (the initial element is already shown).
  let prevEl: T | undefined = options.appear ? undefined : (initSource as T | undefined);

  function exitTransition(el: T | undefined, after?: () => void) {
    if (!el) return after && after();
    isExiting = true;
    onExit(el, () => {
      isExiting = false;
      updateList(p => p.filter(e => e !== el));
      after && after();
    });
  }

  function enterTransition(after?: () => void) {
    const el = next;
    if (!el) return after && after();
    next = undefined;
    updateList(p => [el, ...p]);
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
            exitTransition(prev);
            enterTransition();
          };

  // createRenderEffect runs its apply synchronously in the reactive pass, before
  // deferred effects, so triggerTransitions (and the updateList calls within it)
  // happen before any user createEffect runs in the same flush.
  createRenderEffect(
    () => source() as T | undefined,
    (el: T | undefined) => {
      if (el !== prevEl) {
        next = el;
        const prev = prevEl;
        prevEl = el;
        triggerTransitions(prev);
      }
    },
  );

  // Call listVersion() only to set up reactive subscriptions; always return
  // currentList directly so reads during the same flush see the latest state.
  return () => {
    listVersion();
    return currentList;
  };
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
  options: ListTransitionOptions<T>,
): Accessor<T[]> {
  const initSource = untrack(source);

  if (isServer) {
    const copy = initSource.slice();
    return () => copy;
  }

  const { onChange } = options;

  // Pre-seeded with initSource so the first memo run skips the transition
  // when appear is false (all elements are already "known").
  let prevSet: ReadonlySet<T> = new Set(options.appear ? undefined : initSource);
  const exiting = new WeakSet<T>();

  // Pending removals are accumulated in a plain array and consumed atomically by
  // the memo. Using a version counter signal instead of storing in a signal avoids
  // mutating signal-owned values.
  const pendingRemovals: T[] = [];
  const [removeVersion, setRemoveVersion] = createSignal(0, VERSION_SIGNAL_OPTS);

  const finishRemoved: (els: T[]) => void =
    options.exitMethod === "remove"
      ? noop
      : els => {
          pendingRemovals.push(...els);
          for (const el of els) exiting.delete(el);
          setRemoveVersion(v => v + 1);
        };

  const handleRemoved: (els: T[], el: T, i: number) => void =
    options.exitMethod === "remove"
      ? noop
      : options.exitMethod === "keep-index"
        ? (els, el, i) => els.splice(i, 0, el)
        : (els, el) => els.push(el);

  // createMemo is pull-based: it recomputes synchronously when read and its deps
  // are stale, so user effects that read this memo see the latest list immediately
  // after a flush without requiring an additional flush cycle.
  return createMemo((prev: T[] = options.appear ? [] : initSource.slice()) => {
    removeVersion(); // track version for finishRemoved-driven recomputation
    const sourceList = source();
    (sourceList as any)[$TRACK]; // top level store tracking

    if (pendingRemovals.length) {
      const toRemove = pendingRemovals.splice(0); // take all and clear atomically
      const next = prev.filter(e => !toRemove.includes(e));
      untrack(() =>
        onChange({ list: next, added: [], removed: [], unchanged: next, finishRemoved }),
      );
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
  });
}
