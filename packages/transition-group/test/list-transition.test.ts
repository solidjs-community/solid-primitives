import { describe, it, expect, vi } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createListTransition, ListTransitionOptions } from "../src";

describe("createListTransition", () => {
  const el1 = document.createElement("div");
  const el2 = document.createElement("div");
  const el3 = document.createElement("div");
  const el4 = document.createElement("div");

  it("renders items immediately on the initial run", () =>
    createRoot(dispose => {
      const result = createListTransition(() => [el1, el2], {
        onChange: () => {},
      });
      expect(result()).toHaveLength(2);
      expect(result()[0]).toBe(el1);
      expect(result()[1]).toBe(el2);
      dispose();
    }));

  it("reacts to changes to children", () =>
    createRoot(dispose => {
      const [children, setChildren] = createSignal<Element[]>([]);
      const result = createListTransition(children, {
        onChange: () => {},
      });
      expect(result()).toHaveLength(0);

      setChildren([el1, el2]);
      expect(result()).toHaveLength(2);
      expect(result()[0]).toBe(el1);
      expect(result()[1]).toBe(el2);
      dispose();
    }));

  it("transitions added, removed and moved elements", () => {
    return createRoot(dispose => {
      const [children, setChildren] = createSignal<Element[]>([el1, el2]);
      const fn = vi.fn();
      const result = createListTransition(children, {
        onChange: fn,
      });
      expect(result()).toHaveLength(2);

      setChildren([el3, el1, el4]);
      expect(result()).toHaveLength(4);
      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith({
        added: [el3, el4],
        removed: [el2],
        moved: [el1],
        finishRemoved: expect.any(Function),
      } satisfies Parameters<ListTransitionOptions<Element>["onChange"]>[0]);

      const done = fn.mock.calls[0]![0].finishRemoved;
      done([el2]);
      expect(result()).toHaveLength(3);

      dispose();
    });
  });

  it("transitions element in on appear", () => {
    return createRoot(dispose => {
      const fn = vi.fn();
      const result = createListTransition(() => [el1, el2], {
        onChange: fn,
        appear: true,
      });
      expect(result()).toHaveLength(2);
      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith({
        added: [el1, el2],
        removed: [],
        moved: [],
        finishRemoved: expect.any(Function),
      });

      dispose();
    });
  });

  it("can transition multiple leaving elements", () => {
    return createRoot(dispose => {
      const [children, setChildren] = createSignal<Element[]>([el1, el2]);
      const fn = vi.fn();
      const result = createListTransition(children, {
        onChange: fn,
      });
      expect(result()).toHaveLength(2);

      setChildren([el2, el3]);
      expect(result()).toHaveLength(3);
      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith({
        added: [el3],
        removed: [el1],
        moved: [el2],
        finishRemoved: expect.any(Function),
      });

      const done1 = fn.mock.calls[0]![0].finishRemoved;

      setChildren([]);

      expect(result()).toHaveLength(3);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenLastCalledWith({
        added: [],
        removed: [el2, el3],
        moved: [],
        finishRemoved: expect.any(Function),
      });

      const done2 = fn.mock.calls[1]![0].finishRemoved;

      done1([el1]);
      expect(result()).toHaveLength(2);
      expect(result()[0]).toBe(el2);
      expect(result()[1]).toBe(el3);

      done2([el2, el3]);
      expect(result()).toHaveLength(0);

      dispose();
    });
  });
});
