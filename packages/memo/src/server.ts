import { noop } from "@solid-primitives/utils";
import { Accessor } from "solid-js";
import * as API from "./index";

export const createPureReaction: typeof API.createPureReaction = () => noop;

export const createCurtain = API.createCurtain;

export const createWritableMemo = API.createWritableMemo;

export const createDebouncedMemo: typeof API.createDebouncedMemo = (calc, timeoutMs, options) => {
  const value = calc(options?.value as any);
  return () => value;
};

export const createThrottledMemo: typeof API.createThrottledMemo = (calc, timeoutMs, options) => {
  const value = calc(options?.value as any);
  return () => value;
};

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
