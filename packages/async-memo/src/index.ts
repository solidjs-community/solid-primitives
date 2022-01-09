import { Accessor, createComputed, createSignal, untrack } from "solid-js";
import { EffectOptions } from "solid-js/types/reactive/signal";

export type AsyncMemoOptions<T> = EffectOptions & { value?: T };
// prettier-ignore
export type AsyncMemoCalculation<T, Init = undefined> =
  (prev: T | Init, currect: Accessor<T | Init>) => Promise<T> | T;

export function createAsyncMemo<T>(
  calc: AsyncMemoCalculation<T, T>,
  options: AsyncMemoOptions<T> & { value: T }
): Accessor<T>;
export function createAsyncMemo<T>(
  calc: AsyncMemoCalculation<T>,
  options?: AsyncMemoOptions<T>
): Accessor<T | undefined>;
export function createAsyncMemo<T>(
  calc: AsyncMemoCalculation<T>,
  options?: AsyncMemoOptions<T>
): Accessor<T | undefined> {
  const [state, setState] = createSignal<T | undefined>(options?.value);

  // prettier-ignore
  createComputed(() => {
    const v = calc(untrack(state), state);
    if (v instanceof Promise) v.then(r => setState(() => r));
    else setState(() => v);
  }, undefined, options);

  return state;
}

export function preserveOrder<T, Init = undefined>(
  calc: AsyncMemoCalculation<T, Init>
): AsyncMemoCalculation<T, Init> {
  /** pending promises from oldest to newest */
  const order: Promise<T>[] = [];

  return (prev, current) => {
    const returns = calc(prev, current);
    if (!(returns instanceof Promise)) return returns;

    order.push(returns);
    // returned promise will only resolve desired value if wasn't removed from order array
    const promise = returns.then(r => (order.includes(returns) ? r : (current() as T)));
    // when a promise finishes, it removes itself, and every older promise,
    // blocking them from overwriting the value if they finish later
    returns.finally(() => {
      const index = order.indexOf(returns);
      order.splice(0, index + 1);
    });
    return promise;
  };
}

// const x = createAsyncMemo(() => 133);
// const y = createAsyncMemo(preserveOrder(() => 123));
