import {
  Accessor,
  createComputed,
  createSignal,
  getOwner,
  onCleanup,
  runWithOwner
} from "solid-js";
import { EffectOptions, Owner } from "solid-js/types/reactive/signal";

export type LazyMemoOptions<T> = EffectOptions & {
  value?: T;
  init?: boolean;
};

/**
 * Lazily evaluated `createMemo`. Will run the calculation only if is being listened to.
 *
 * @param calc pure reactive calculation returning some value
 * @param options for configuring initial state: *(before first read)*
 * - `value` - initial value of the signal
 * - `init` - if **true**, will run the calculation initially, to get the initial value
 * @returns signal of a value that was returned by the calculation
 */

// both init run was enabled and initial value provided
export function createLazyMemo<T>(
  calc: (prev: T) => T,
  options: EffectOptions & { value: T; init: true }
): Accessor<T>;
// initial value was provided
export function createLazyMemo<T>(
  calc: (prev: T) => T,
  options: LazyMemoOptions<T> & { value: T }
): Accessor<T>;
// calculation will run initially
export function createLazyMemo<T>(
  calc: (prev: T | undefined) => T,
  options: LazyMemoOptions<T> & { init: true }
): Accessor<T>;
// no initial value was provided
export function createLazyMemo<T>(
  calc: (prev: T | undefined) => T,
  options?: LazyMemoOptions<T>
): Accessor<T | undefined>;
export function createLazyMemo<T>(
  calc: (prev: T | undefined) => T,
  options?: LazyMemoOptions<T>
): Accessor<T | undefined> {
  const initValue: T | undefined = options?.value ?? undefined;
  const [state, setState] = createSignal(options?.init ? calc(initValue) : initValue);

  /** number of places where the state is being actively observed */
  let listeners = 0;
  /** is there a computation already running */
  let isActive = false;
  /** original root in which the primitive was initially run */
  const owner = getOwner();

  /**
   * will create reactive computation with the original owner,
   * but only if there isn't one already running */
  function recreateComputation() {
    if (listeners !== 1 || isActive) return;
    isActive = true;
    // prettier-ignore
    runWithOwner(owner as Owner, () => createComputed(() => {
      if (listeners > 0) setState((prev: T | undefined) => calc(prev));
      else isActive = false;
    }));
  }

  // wrapped signal accessor
  return () => {
    if (getOwner()) {
      listeners++;
      onCleanup(() => listeners--);
      recreateComputation();
    }
    return state();
  };
}
