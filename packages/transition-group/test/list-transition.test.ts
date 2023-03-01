import { describe, it, test, expect, vi } from "vitest";
import { createEffect, createRoot, createSignal, untrack } from "solid-js";
import { createListTransition, OnListChange } from "../src";

type OnChangeParams = Parameters<OnListChange<Element>>[0];

describe("createListTransition", () => {
  const el1 = document.createElement("div");
  const el2 = document.createElement("span");
  const el3 = document.createElement("button");
  const el4 = document.createElement("section");

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

  it("reacts to changes to children", () => {
    const [children, setChildren] = createSignal<Element[]>([]);

    const { result, dispose } = createRoot(dispose => {
      const result = createListTransition(children, {
        onChange: () => {},
      });
      expect(result()).toHaveLength(0);
      return { result, dispose };
    });
    expect(result()).toHaveLength(0);

    setChildren([el1, el2]);
    expect(result()).toHaveLength(2);
    expect(result()[0]).toBe(el1);
    expect(result()[1]).toBe(el2);

    dispose();
  });

  it("transitions added, removed and moved elements", () => {
    const [children, setChildren] = createSignal<Element[]>([el1, el2]);
    const fn = vi.fn();

    const { result, dispose } = createRoot(dispose => {
      const result = createListTransition(children, {
        onChange: fn,
      });
      expect(result()).toHaveLength(2);
      expect(fn).not.toHaveBeenCalled();
      return { result, dispose };
    });
    expect(result()).toHaveLength(2);
    expect(fn).not.toHaveBeenCalled();

    setChildren([el3, el1, el4]);
    expect(result()).toHaveLength(4);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith({
      list: [el3, el1, el4, el2],
      added: [el3, el4],
      removed: [el2],
      unchanged: [el1],
      finishRemoved: expect.any(Function),
    } satisfies OnChangeParams);

    const done = fn.mock.calls[0]![0].finishRemoved;
    done([el2]);
    expect(result()).toHaveLength(3);

    dispose();
  });

  it("transitions element in on appear", () => {
    createRoot(dispose => {
      const fn = vi.fn();

      const result = createListTransition(() => [el1, el2], {
        onChange: fn,
        appear: true,
      });

      expect(result()).toHaveLength(2);
      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith({
        list: [el1, el2],
        added: [el1, el2],
        removed: [],
        unchanged: [],
        finishRemoved: expect.any(Function),
      } satisfies OnChangeParams);

      dispose();
    });
  });

  it("can transition multiple leaving elements", () => {
    const [children, setChildren] = createSignal<Element[]>([el1, el2]);
    const fn = vi.fn();

    const { result, dispose } = createRoot(dispose => {
      const result = createListTransition(children, {
        onChange: fn,
      });
      expect(result()).toHaveLength(2);
      return { dispose, result };
    });

    setChildren([el2, el3]);
    expect(result()).toHaveLength(3);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith({
      list: [el2, el3, el1],
      added: [el3],
      removed: [el1],
      unchanged: [el2],
      finishRemoved: expect.any(Function),
    } satisfies OnChangeParams);

    const done1 = fn.mock.calls[0]![0].finishRemoved;

    setChildren([]);

    expect(result()).toHaveLength(3);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith({
      list: [el2, el3, el1],
      added: [],
      removed: [el2, el3],
      unchanged: [],
      finishRemoved: expect.any(Function),
    } satisfies OnChangeParams);

    const done2 = fn.mock.calls[1]![0].finishRemoved;

    done1([el1]);
    expect(result()).toHaveLength(2);
    expect(result()[0]).toBe(el2);
    expect(result()[1]).toBe(el3);

    done2([el2, el3]);
    expect(result()).toHaveLength(0);

    dispose();
  });

  it("removes elements immediately if enabled", () => {
    createRoot(dispose => {
      const [children, setChildren] = createSignal<Element[]>([el1, el2]);
      const fn = vi.fn();

      const result = createListTransition(children, {
        onChange: fn,
        exitMethod: "remove",
      });
      expect(result()).toHaveLength(2);

      setChildren([el2, el3]);
      expect(result()).toHaveLength(2);
      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith({
        list: [el2, el3],
        added: [el3],
        removed: [el1],
        unchanged: [el2],
        finishRemoved: expect.any(Function),
      } satisfies OnChangeParams);

      dispose();
    });

    it("keeps index if removed elements if enabled", () => {
      createRoot(dispose => {
        const [children, setChildren] = createSignal<Element[]>([el1, el2, el3]);
        const fn = vi.fn();

        const result = createListTransition(children, {
          onChange: fn,
          exitMethod: "keep-index",
        });
        expect(result()).toHaveLength(2);

        setChildren([el1, el3]);
        expect(result()).toHaveLength(3);
        expect(fn).toHaveBeenCalledOnce();
        expect(fn).toHaveBeenCalledWith({
          list: [el1, el2, el3],
          added: [el3],
          removed: [el1],
          unchanged: [el2],
          finishRemoved: expect.any(Function),
        } satisfies OnChangeParams);

        dispose();
      });
    });
  });

  /*

  Transitions will run even if under suspense.

  it("suspends under Suspense", () => {
    const onChange = vi.fn();

    const [children, setChildren] = createSignal<Element[]>([el1]);
    const [runResource, setRunResource] = createSignal(true);
    let resolve = () => {};

    const dispose = createRoot(dispose => {
      const [res] = createResource(runResource, () => new Promise<void>(r => (resolve = r)));
      Suspense({
        get children() {
          createRenderEffect(res);
          return createListTransition(children, { onChange });
        },
      });
      return dispose;
    });

    expect(onChange).not.toHaveBeenCalled();

    setChildren([el2]);

    expect(onChange).not.toHaveBeenCalled();

    resolve();
    setRunResource(false);

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenLastCalledWith({
      added: [el2],
      removed: [el1],
      moved: [],
      finishRemoved: expect.any(Function),
    });

    setChildren([el1, el3]);

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith({
      added: [el1, el3],
      removed: [el2],
      moved: [],
      finishRemoved: expect.any(Function),
    });

    dispose();

  });
  
  */

  test("updated list should be available in user effects", () => {
    let effRuns = 0;

    const dispose = createRoot(dispose => {
      const [children, setChildren] = createSignal<Element[]>([]);

      createEffect(() => {
        effRuns++;
        children();
        expect(untrack(result), "effect after root").toHaveLength(1);
        expect(untrack(result)[0]).toBe(el1);
      });

      const result = createListTransition(children, {
        onChange: () => {},
        exitMethod: "remove",
      });
      expect(result(), "initial").toHaveLength(0);

      setChildren([el1]);
      expect(result(), "after sync assign").toHaveLength(1);
      expect(result()[0]).toBe(el1);

      return dispose;
    });

    expect(effRuns).toBe(1);

    dispose();
  });
});
