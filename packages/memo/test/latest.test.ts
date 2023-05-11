import { describe, test, expect } from "vitest";
import { batch, createRoot, createSignal } from "solid-js";
import { createLatest, createLatestMany } from "../src";

describe("createLatest", () => {
  test("should return the latest value", () => {
    createRoot(dispose => {
      const [a, setA] = createSignal({ a: 1 });
      const [b, setB] = createSignal({ b: 2 });
      const latest = createLatest([a, b]);
      expect(latest()).toEqual({ b: 2 });
      setA({ a: 3 });
      expect(latest()).toEqual({ a: 3 });
      setB({ b: 4 });
      expect(latest()).toEqual({ b: 4 });
      setB({ b: 5 });
      setA({ a: 6 });
      expect(latest()).toEqual({ a: 6 });
      setB({ b: 7 });
      expect(latest()).toEqual({ b: 7 });
      batch(() => {
        setB({ b: 8 });
        setA({ a: 9 });
        expect(latest()).toEqual({ b: 8 });
      });
      expect(latest()).toEqual({ b: 8 });
      dispose();
    });
  });
});

describe("createLatestMany", () => {
  test("should return the latest values", () => {
    createRoot(dispose => {
      const [a, setA] = createSignal({ a: 1 });
      const [b, setB] = createSignal({ b: 2 });
      const latest = createLatestMany([a, b]);
      expect(latest()).toEqual([{ a: 1 }, { b: 2 }]);
      setA({ a: 3 });
      expect(latest()).toEqual([{ a: 3 }]);
      setB({ b: 4 });
      expect(latest()).toEqual([{ b: 4 }]);
      setB({ b: 5 });
      setA({ a: 6 });
      expect(latest()).toEqual([{ a: 6 }, { b: 5 }]);
      setB({ b: 7 });
      expect(latest()).toEqual([{ b: 7 }]);
      batch(() => {
        setB({ b: 8 });
        setA({ a: 9 });
        expect(latest()).toEqual([{ a: 9 }, { b: 8 }]);
      });
      expect(latest()).toEqual([{ a: 9 }, { b: 8 }]);
      dispose();
    });
  });
});
