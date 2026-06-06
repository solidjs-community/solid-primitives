import { expect, describe, it } from "vitest";
import { createRoot, createSignal, flush, onCleanup } from "solid-js";
import { mapRange } from "../src/index.js";

describe("mapRange", () => {
  it("returns a correct array", () =>
    createRoot(dispose => {
      expect(
        mapRange(
          () => -3.5,
          () => 0.2,
          () => 1.5,
          n => n,
        )(),
      ).toEqual([-3.5, -2, -0.5]);

      const a = mapRange(
        () => 0,
        () => 2,
        () => 0.2,
        n => n,
      )();
      for (let n = 0, i = 0; i < 10; n += 0.2, i++) {
        expect(a[i]).toBe(n);
      }

      expect(
        mapRange(
          () => 5,
          () => -5,
          () => 2,
          n => n,
        )(),
      ).toEqual([5, 3, 1, -1, -3]);

      expect(
        mapRange(
          () => 0,
          () => 0.5,
          () => 1,
          n => n,
        )(),
      ).toEqual([0]);

      expect(
        mapRange(
          () => 0.5,
          () => 0,
          () => 1,
          n => n,
        )(),
      ).toEqual([0.5]);

      dispose();
    }));

  it("updates to correct array", () => {
    const [start, setStart] = createSignal(-3.5);
    const [to, setTo] = createSignal(0.2);
    const [step, setStep] = createSignal(1.5);

    const [dispose, mapped] = createRoot(dispose => [dispose, mapRange(start, to, step, n => n)] as const);

    expect(mapped()).toEqual([-3.5, -2, -0.5]);

    setStart(0);
    setTo(2);
    setStep(0.2);
    flush();
    const a = mapped();
    for (let n = 0, i = 0; i < 10; n += 0.2, i++) {
      expect(a[i]).toBe(n);
    }

    setStart(5);
    setTo(-5);
    setStep(2);
    flush();
    expect(mapped()).toEqual([5, 3, 1, -1, -3]);

    dispose();
  });

  it("maps only added numbers", () => {
    const [start, setStart] = createSignal(4);
    const [to, setTo] = createSignal(8);
    const [step, setStep] = createSignal(1);
    const captured: (string | number)[] = [];

    const [dispose, mapped] = createRoot(dispose => [
      dispose,
      mapRange(start, to, step, n => {
        captured.push(n);
      }),
    ] as const);

    mapped();
    expect(captured).toEqual([4, 5, 6, 7]);

    setStart(6);
    setTo(9);
    flush();
    mapped();
    expect(captured).toEqual([4, 5, 6, 7, 8]);

    setStart(4);
    setTo(7);
    flush();
    mapped();
    expect(captured).toEqual([4, 5, 6, 7, 8, 4, 5]);

    setStart(3);
    setStep(1.5);
    flush();
    mapped();
    expect(captured).toEqual([4, 5, 6, 7, 8, 4, 5, 3, 4.5]);

    dispose();
  });

  it("disposes on remove and cleanup", () => {
    const [start, setStart] = createSignal(4);
    const [to, setTo] = createSignal(8);
    const [step, setStep] = createSignal(1);
    const captured: (string | number)[] = [];

    const [dispose, mapped] = createRoot(dispose => [
      dispose,
      mapRange(start, to, step, n => {
        onCleanup(() => captured.push(n));
      }),
    ] as const);

    mapped();
    expect(captured).toEqual([]);

    setStart(6);
    setTo(9);
    flush();
    mapped();
    expect(captured).toEqual([4, 5]);

    setStart(4);
    setTo(7);
    flush();
    mapped();
    expect(captured).toEqual([4, 5, 7, 8]);

    setStart(3);
    setStep(1.5);
    flush();
    mapped();
    expect(captured).toEqual([4, 5, 7, 8, 4, 5]);

    dispose();
  });

  it("displays a fallback", () => {
    const [start, setStart] = createSignal(4);
    const [to, setTo] = createSignal(8);
    const [step] = createSignal(1);

    const [dispose, mapped] = createRoot(dispose => [
      dispose,
      mapRange<string | number>(start, to, step, n => n, { fallback: () => "fb" }),
    ] as const);

    setStart(0);
    setTo(0);
    flush();
    expect(mapped()).toEqual(["fb"]);

    setTo(2);
    flush();
    expect(mapped()).toEqual([0, 1]);

    dispose();
  });
});
