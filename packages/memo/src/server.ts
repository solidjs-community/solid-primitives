import { noop } from "@solid-primitives/utils";
import { Accessor, createMemo, on } from "solid-js";
import * as API from "./index";

export const createPureReaction: typeof API.createPureReaction = () => noop;

export const createCurtain = API.createCurtain;

export const createWritableMemo = API.createWritableMemo;

export const createDebouncedMemo: typeof API.createDebouncedMemo = ((calc, timeoutMs, init) => {
  const value = calc(init as any);
  return () => value;
}) as typeof API.createDebouncedMemo;

export const createDebouncedMemoOn: typeof API.createDebouncedMemoOn = ((
  deps,
  calc,
  timeoutMs,
  init,
  options
) =>
  createMemo(
    on(deps, calc as any) as () => any,
    init,
    options
  )) as typeof API.createDebouncedMemoOn;

export const createThrottledMemo: typeof API.createThrottledMemo = ((calc, timeoutMs, init) => {
  const value = calc(init as any);
  return () => value;
}) as typeof API.createThrottledMemo;

export const createAsyncMemo: typeof API.createAsyncMemo = (calc, options) => options?.value;

export const createLazyMemo: typeof API.createLazyMemo = (calc, initial) => {
  let value: any;
  let calculatedValue = false;
  return () => {
    if (!calculatedValue) {
      calculatedValue = true;
      value = calc(initial as any);
    }
    return value;
  };
};

export const createMemoCache = (...args: any[]) => {
  if (args[1] === "function") {
    const key = args[0];
    return createLazyMemo(() => args[1](key()));
  } else {
    const cache = new Map<unknown, Accessor<unknown>>();
    return (key: unknown) => {
      let cached = cache.get(key);
      if (!cached) cache.set(key, (cached = createLazyMemo(() => args[0](key))));
      return cached();
    };
  }
};
