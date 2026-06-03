import { expect, describe, it } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { createNumericRange } from "../src/index.js";

describe("createNumericRange", () => {
  it("single argument: [0, to)", () =>
    createRoot(dispose => {
      expect(createNumericRange(5)()).toEqual([0, 1, 2, 3, 4]);
      expect(createNumericRange(1)()).toEqual([0]);
      expect(createNumericRange(0)()).toEqual([]);
      dispose();
    }));

  it("two arguments: [start, to)", () =>
    createRoot(dispose => {
      expect(createNumericRange(2, 5)()).toEqual([2, 3, 4]);
      expect(createNumericRange(0, 3)()).toEqual([0, 1, 2]);
      expect(createNumericRange(3, 3)()).toEqual([]);
      dispose();
    }));

  it("three arguments: [start, to) by step", () =>
    createRoot(dispose => {
      expect(createNumericRange(0, 10, 2)()).toEqual([0, 2, 4, 6, 8]);
      expect(createNumericRange(1, 10, 3)()).toEqual([1, 4, 7]);
      expect(createNumericRange(0, 1, 0.5)()).toEqual([0, 0.5]);
      dispose();
    }));

  it("descending range", () =>
    createRoot(dispose => {
      expect(createNumericRange(5, 0)()).toEqual([5, 4, 3, 2, 1]);
      expect(createNumericRange(10, 4, 2)()).toEqual([10, 8, 6]);
      dispose();
    }));

  it("reactive single argument", () => {
    const [to, setTo] = createSignal(3);
    const [dispose, nums] = createRoot(dispose => [dispose, createNumericRange(to)] as const);

    expect(nums()).toEqual([0, 1, 2]);
    setTo(5);
    flush();
    expect(nums()).toEqual([0, 1, 2, 3, 4]);
    setTo(1);
    flush();
    expect(nums()).toEqual([0]);

    dispose();
  });

  it("reactive start and to", () => {
    const [start, setStart] = createSignal(2);
    const [to, setTo] = createSignal(6);
    const [dispose, nums] = createRoot(dispose => [dispose, createNumericRange(start, to)] as const);

    expect(nums()).toEqual([2, 3, 4, 5]);
    setStart(4);
    flush();
    expect(nums()).toEqual([4, 5]);
    setTo(8);
    flush();
    expect(nums()).toEqual([4, 5, 6, 7]);

    dispose();
  });

  it("reactive step", () => {
    const [step, setStep] = createSignal(1);
    const [dispose, nums] = createRoot(dispose => [dispose, createNumericRange(0, 6, step)] as const);

    expect(nums()).toEqual([0, 1, 2, 3, 4, 5]);
    setStep(2);
    flush();
    expect(nums()).toEqual([0, 2, 4]);

    dispose();
  });
});
