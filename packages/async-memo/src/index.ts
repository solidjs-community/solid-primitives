import { Accessor, createComputed, createSignal, untrack } from "solid-js";
import { EffectOptions } from "solid-js/types/reactive/signal";

export type AsyncMemoOptions<T> = EffectOptions & { value?: T };
export type AsyncMemoCalculation<T, Init = undefined> = (prev: T | Init) => Promise<T> | T;

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
  /** pending promises from oldest to newest */
  const order: Promise<T>[] = [];

  // prettier-ignore
  createComputed(async () => {
    const value = calc(untrack(state));
    if (value instanceof Promise) {
      order.push(value);
      // resolved value will only be written to the signal,
      // if the promise wasn't removed from the array
      value.then(r => order.includes(value) && setState(() => r))
      // when a promise finishes, it removes itself, and every older promise from array,
      // blocking them from overwriting the state if they finish after
      value.finally(() => {
        const index = order.indexOf(value);
        order.splice(0, index + 1);
      });
    }
    else setState(() => value);
  }, undefined, options);

  return state;
}
