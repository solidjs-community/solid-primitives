import { createFluxStore } from "../../src/index";
import type { SetStoreFunction } from "solid-js/store";

export interface CounterState {
  id?: string;
  value: number;
  initialValue: number;
}
export interface CounterGetters {
  toString: () => string;
  isZero: () => boolean;
  isNegative: () => boolean;
  isPositive: () => boolean;
  get: () => number;
}
export interface CounterActions {
  setState: SetStoreFunction<CounterState>;
  updateId: (newId: string) => void;
  resetCount: (overrideValue?: number) => void;
}

export const counterStore = createFluxStore(
  {
    value: 0,
    initialValue: 0
  } as CounterState,
  {
    getters: (state): CounterGetters => ({
      toString: () => `${state.id && "-"}(${state.value})`,
      isZero: () => state.value === 0,
      isNegative: () => state.value < 0,
      isPositive: () => state.value >= 0,
      get: () => state.value
    }),
    actions: (setState): CounterActions => ({
      setState,
      updateId: newId => setState("id", newId),
      resetCount: overrideValue =>
        setState(proxy => ({ ...proxy, value: overrideValue ?? proxy.initialValue }))
    })
  }
);
