import { createSignal } from 'solid-js';
import type { Accessor } from 'solid-js';

export function createReducer<T, U extends Array<W>, W>(
  dispatcher: (state: T, ...args: U) => T,
  initialState: T
): [Accessor<T>, (...args: U) => void] {
  const [state, setState] = createSignal(initialState);

  return [
    state,
    (...args: U) => void (setState((state) => dispatcher(state, ...args)))
  ];
}
