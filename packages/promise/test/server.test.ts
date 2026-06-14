import { describe, test, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { until, changed, promiseTimeout, raceTimeout } from "../src/index.js";

describe("SSR", () => {
  test("promiseTimeout does not throw on server", () => {
    expect(() => promiseTimeout(100)).not.toThrow();
  });

  test("raceTimeout does not throw on server", () => {
    expect(() => raceTimeout(promiseTimeout(100), 200)).not.toThrow();
  });

  test("until can be created and disposed on server", () => {
    const [state] = createSignal(false);
    let promise: ReturnType<typeof until>;
    expect(() => {
      promise = until(state);
    }).not.toThrow();
    promise!.catch(() => {});
    promise!.dispose();
  });

  test("changed does not throw on server", () => {
    const [count] = createSignal(0);
    expect(() => changed(count, 1)).not.toThrow();
  });
});
