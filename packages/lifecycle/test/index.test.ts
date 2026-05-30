import { describe, test, expect } from "vitest";
import { createMemo, createRoot, createSignal, flush, onSettled, sharedConfig } from "solid-js";
import { createIsMounted, isHydrated } from "../src/index.js";

describe("createIsMounted", () => {
  test("createIsMounted", () => {
    let isMounted!: () => boolean;
    const dispose = createRoot(d => {
      isMounted = createIsMounted();
      expect(isMounted()).toBe(false);
      return d;
    });

    flush();
    expect(isMounted()).toBe(true);
    dispose();
  });

  test("setIsMounted(true) is applied synchronously within the triggering flush", () => {
    // Confirms that flush() inside onSettled is not needed: the write is already
    // visible to subsequent onSettled callbacks registered in the same owner.
    let readInLaterOnSettled: boolean | undefined;
    const dispose = createRoot(d => {
      const isMounted = createIsMounted(); // registers onSettled #1: setIsMounted(true)
      onSettled(() => {                    // registers onSettled #2
        readInLaterOnSettled = isMounted();
      });
      return d;
    });

    flush();
    expect(readInLaterOnSettled).toBe(true);
    dispose();
  });
});

describe("isHydrated", () => {
  test("isHydrated", () => {
    expect(isHydrated()).toBe(true);
  });

  test("multiple isMounted signals created during hydration all resolve after hydration ends", () => {
    // When isHydrated() is called in a reactive scope multiple times during hydration
    // (e.g. the computation re-runs due to another signal change), each call creates a
    // distinct isMounted signal. They should all resolve to true once hydration ends.
    sharedConfig.hydrating = true;

    let isMounted1!: () => boolean;
    let isMounted2!: () => boolean;

    const dispose = createRoot(d => {
      isMounted1 = createIsMounted();
      isMounted2 = createIsMounted();
      return d;
    });

    try {
      expect(isMounted1()).toBe(false);
      expect(isMounted2()).toBe(false);

      sharedConfig.hydrating = false;
      flush();

      expect(isMounted1()).toBe(true);
      expect(isMounted2()).toBe(true);
    } finally {
      dispose();
      sharedConfig.hydrating = false;
    }
  });

  test("isHydrated reactive computation stabilises after exactly one post-hydration re-run", () => {
    // With sharedConfig.hydrating = true, a memo calling isHydrated() creates an
    // isMounted signal and returns false. Once hydration ends and flush() is called,
    // onSettled fires and the signal becomes true — the memo re-runs exactly once
    // and returns true, with no further cascade.
    sharedConfig.hydrating = true;

    let trueCount = 0;
    let hydrated!: () => boolean;

    const dispose = createRoot(d => {
      hydrated = createMemo(() => {
        const result = isHydrated();
        if (result) trueCount++;
        return result;
      });
      return d;
    });

    try {
      expect(hydrated()).toBe(false);

      sharedConfig.hydrating = false; // hydration ends before flush, as in production
      flush(); // onSettled fires → isMounted=true → memo re-runs once → returns true

      expect(hydrated()).toBe(true);
      expect(trueCount).toBe(1); // no cascade
    } finally {
      dispose();
      sharedConfig.hydrating = false;
    }
  });
});
