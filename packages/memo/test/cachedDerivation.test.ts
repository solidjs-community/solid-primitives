import { describe, it, expect, vi } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createCachedDerivation } from "../src";

// TODO
// - [ ] Test disposing (should stop updating)
// - [ ] timing - if both the derivation and some other computation are observing the same source, the derivation should be updated first
// - [ ] calculation gets executed where it has been read (computations gets created where they are read)

describe("createCachedDerivation", () => {
  it("caches the result", () => {
    createRoot(dispose => {
      const [source, setSource] = createSignal("0");
      const cb = vi.fn();
      cb.mockReturnValue(1);
      const res = createCachedDerivation(source, cb);
      expect(res()).toBe(1);
      expect(cb).toBeCalledTimes(1);
      expect(res()).toBe(1);
      expect(cb).toBeCalledTimes(1);
      expect(cb).toBeCalledWith("0", undefined, undefined);

      cb.mockReturnValue(5);
      setSource("1");
      expect(cb, "calc shouldn't be called on invalidation").toBeCalledTimes(1);
      expect(res()).toBe(5);
      expect(cb).toBeCalledTimes(2);
      expect(res()).toBe(5);
      expect(cb).toBeCalledTimes(2);
      expect(cb).toBeCalledWith("1", "0", 1);

      dispose();
    });
  });

  it("sources can be an array", () => {
    createRoot(dispose => {
      const [source1, setSource1] = createSignal("0");
      const cb = vi.fn();
      cb.mockReturnValue(1);
      const res = createCachedDerivation<[string, string], number>([source1, () => "foo"], cb);
      expect(res()).toBe(1);
      expect(cb).toBeCalledTimes(1);
      expect(res()).toBe(1);
      expect(cb).toBeCalledTimes(1);
      expect(cb).toBeCalledWith(["0", "foo"], undefined, undefined);

      cb.mockReturnValue(5);
      setSource1("1");
      expect(cb, "calc shouldn't be called on invalidation").toBeCalledTimes(1);
      expect(res()).toBe(5);
      expect(cb).toBeCalledTimes(2);
      expect(res()).toBe(5);
      expect(cb).toBeCalledTimes(2);
      expect(cb).toBeCalledWith(["1", "foo"], ["0", "foo"], 1);

      dispose();
    });
  });
});
