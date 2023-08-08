import { expect, describe, it } from "vitest";
import { createRoot, createSignal, onCleanup } from "solid-js";
import { indexRange } from "../src/index.js";

describe("indexRange", () => {
  it("returns a correct array", () =>
    createRoot(dispose => {
      expect(
        indexRange(
          () => -3.5,
          () => 0.2,
          () => 1.5,
          n => n(),
        )(),
      ).toEqual([-3.5, -2, -0.5]);

      const a = indexRange(
        () => 0,
        () => 2,
        () => 0.2,
        n => n(),
      )();
      for (let n = 0, i = 0; i < 10; n += 0.2, i++) {
        expect(a[i]).toBe(n);
      }

      expect(
        indexRange(
          () => 5,
          () => -5,
          () => 2,
          n => n(),
        )(),
      ).toEqual([5, 3, 1, -1, -3]);

      expect(
        indexRange(
          () => 0,
          () => 0.5,
          () => 1,
          n => n(),
        )(),
      ).toEqual([0]);

      expect(
        indexRange(
          () => 0.5,
          () => 0,
          () => 1,
          n => n(),
        )(),
      ).toEqual([0.5]);

      dispose();
    }));

  it("updates to correct array", () =>
    createRoot(dispose => {
      const [start, setStart] = createSignal(-3.5);
      const [to, setTo] = createSignal(0.2);
      const [step, setStep] = createSignal(1.5);

      const mapped = indexRange(start, to, step, n => n);

      const a = mapped();
      expect(a.length).toBe(3);
      expect(a[0]()).toBe(-3.5);
      expect(a[1]()).toBe(-2);
      expect(a[2]()).toBe(-0.5);

      setStart(0);
      setTo(2);
      setStep(0.2);
      const b = mapped();
      for (let n = 0, i = 0; i < 10; n += 0.2, i++) {
        expect(b[i]()).toBe(n);
      }

      setStart(5);
      setTo(-5);
      setStep(2);
      const c = mapped();
      expect(c.length).toBe(5);
      expect(c[0]()).toBe(5);
      expect(c[1]()).toBe(3);
      expect(c[2]()).toBe(1);
      expect(c[3]()).toBe(-1);
      expect(c[4]()).toBe(-3);

      dispose();
    }));

  it("maps only added indexes", () =>
    createRoot(dispose => {
      const [start, setStart] = createSignal(4);
      const [to, setTo] = createSignal(8);
      const [step, setStep] = createSignal(1);

      let captured: (string | number)[] = [];
      const mapped = indexRange(start, to, step, n => {
        captured.push(n());
      });

      mapped();
      expect(captured).toEqual([4, 5, 6, 7]);

      setStart(6);
      setTo(9);
      mapped();
      expect(captured).toEqual([4, 5, 6, 7]);

      setStart(4);
      setTo(10);
      mapped();
      expect(captured).toEqual([4, 5, 6, 7, 7, 8, 9]);

      dispose();
    }));

  it("disposes on remove and cleanup", () =>
    createRoot(dispose => {
      const [start, setStart] = createSignal(4);
      const [to, setTo] = createSignal(8);
      const [step, setStep] = createSignal(1);

      let captured: (string | number)[] = [];
      const mapped = indexRange(start, to, step, n => {
        onCleanup(() => captured.push(n()));
      });

      mapped();
      expect(captured).toEqual([]);

      setStart(6);
      setTo(9);
      mapped();
      expect(captured).toEqual([7]);

      setStart(6);
      setTo(9);
      mapped();
      expect(captured).toEqual([7]);

      setStep(1.5);
      mapped();
      expect(captured).toEqual([7, 8]);

      dispose();
    }));

  it("displays a fallback", () =>
    createRoot(dispose => {
      const [start, setStart] = createSignal(4);
      const [to, setTo] = createSignal(8);
      const [step, setStep] = createSignal(1);

      const mapped = indexRange<string | number>(start, to, step, n => n(), {
        fallback: () => "fb",
      });

      setStart(0);
      setTo(0);
      expect(mapped()).toEqual(["fb"]);

      setTo(2);
      expect(mapped()).toEqual([0, 1]);

      dispose();
    }));
});
