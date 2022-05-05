import { createSignal } from 'solid-js';
import type { Accessor } from 'solid-js';

export function createReducer<State, ActionData extends Array<any>>(
  dispatcher: (state: State, ...args: ActionData) => State,
  initialState: State
): [Accessor<State>, (...args: ActionData) => void] {
  const [state, setState] = createSignal(initialState);

  return [
    state,
    (...args: ActionData) => void (setState((state) => dispatcher(state, ...args)))
  ];
}
