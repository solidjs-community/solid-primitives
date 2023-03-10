import { createFluxStore } from "../../src/index";

export type CounterState = {
  id?: string;
  value: number;
  initialValue: number;
};

export const counterStore = createFluxStore(
  {
    value: 0,
    initialValue: 0,
  } as CounterState,
  {
    getters: state => ({
      toString: () => `${state.id && "-"}(${state.value})`,
      isZero: () => state.value === 0,
      isNegative: () => state.value < 0,
      isPositive: () => state.value >= 0,
      get: () => state.value,
    }),
    actions: setState => ({
      setState,
      updateId: (newId: string) => setState("id", newId),
      resetCount: (overrideValue?: number) =>
        setState(proxy => ({ ...proxy, value: overrideValue ?? proxy.initialValue })),
    }),
  },
);

export type CounterGetters = typeof counterStore.getters;
export type CounterActions = typeof counterStore.actions;
