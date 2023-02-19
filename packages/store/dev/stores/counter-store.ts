import { createStoreFactory } from "../../dist";

export interface CounterState {
  id?: string;
  value: number;
  initialValue: number;
}
export interface CounterActions {
  toString: () => string;
  isZero: () => boolean;
  isNegative: () => boolean;
  isPositive: () => boolean;
  updateId: (newId: string) => void;
  resetCount: (overrideValue?: number) => void;
  get: () => number;
}

const [CounterProvider, { useStore: useCounterStore, produce, unwrapped }] = createStoreFactory(
  {
    value: 0,
    initialValue: 0
  } as CounterState,
  (state, setState): CounterActions => {
    return {
      toString: () => `${state.id && "-"}(${state.value})`,
      isZero: () => state.value === 0,
      isNegative: () => state.value < 0,
      isPositive: () => state.value >= 0,
      updateId: newId => setState(val => ({ ...val, id: newId })),
      resetCount: (overrideValue): void =>
        produce(v => {
          v.value = overrideValue ?? v.initialValue;
        }),
      get: () => state.value
    };
  }
);

export { CounterProvider, useCounterStore };
