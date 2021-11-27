import { createModifier } from "@solid-primitives/composites";

export const lerp = (current: number, goal: number, p: number): number =>
  (1 - p) * current + p * goal;

export const withDefault = createModifier<any>((source, cb, fallback) => {
  const _fn = (a: any, b: any, c: any) => {
    const value = cb(a, b, c);
    console.log(value);

    return typeof value === "undefined" || value === null ? fallback : value;
  };
  return [_fn, {}];
});

export const myThrottle = createModifier<number>((source, cb, wait) => {
  let lastExecuted = 0;
  const _fn = (a: any, b: any, c: any) => {
    if (lastExecuted + wait <= performance.now()) {
      lastExecuted = performance.now();
      return cb(a, b, c);
    } else return c;
  };
  return [_fn, {}];
});
