import { Accessor, createComputed, createSignal, untrack } from "solid-js";
import { EffectOptions } from "solid-js/types/reactive/signal";

export type AsyncMemoOptions<T> = EffectOptions & { value?: T };

export function createAsyncMemo<T>(
  calc: (prev: T) => Promise<T> | T,
  options: AsyncMemoOptions<T> & { value: T }
): Accessor<T>;
export function createAsyncMemo<T>(
  calc: (prev: T | undefined) => Promise<T> | T,
  options?: AsyncMemoOptions<T>
): Accessor<T | undefined>;
export function createAsyncMemo<T>(
  calc: (prev: T | undefined) => Promise<T> | T,
  options?: AsyncMemoOptions<T>
): Accessor<T | undefined> {
  const [state, setState] = createSignal<T | undefined>(options?.value);

  // prettier-ignore
  createComputed(() => {
    const v = calc(untrack(state));
    if (v instanceof Promise) v.then(r => setState(() => r));
    else setState(() => v);
  }, undefined, options);

  return state;
}
