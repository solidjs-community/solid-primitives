import { describe, test, expect, vi } from "vitest";
import { createComputed, createRoot } from "solid-js";
import { createEventStack } from "../src";

describe("createEventStack", () => {
  test("emitting and listening", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      let capturedStack: any[] = [];
      let allowRemove = false;

      const { listen, emit, stack } = createEventStack<[string]>();

      listen(({ event, stack, removeFromStack }) => {
        captured.push(event[0]);
        capturedStack = stack;
        if (allowRemove) removeFromStack();
      });

      emit(["foo"]);
      expect(captured[0]).toBe("foo");
      expect(capturedStack.length).toBe(1);
      expect(stack().length).toBe(1);

      emit(["bar"]);
      expect(captured[1]).toBe("bar");
      expect(capturedStack.length).toBe(2);
      expect(stack().length).toBe(2);

      allowRemove = true;
      emit(["baz"]);
      expect(captured[2]).toBe("baz");
      expect(capturedStack.length).toBe(3);
      expect(stack().length).toBe(2);

      dispose();
    }));

  test("clear function", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      const { listen, emit, clear } = createEventStack<{ text: string }>();

      listen(a => captured.push(a));

      clear();

      emit({ text: "foo" });
      expect(captured.length).toBe(0);

      dispose();
    }));

  test("clears on dispose", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      const { listen, emit } = createEventStack<{ text: string }>();

      listen(a => captured.push(a));

      dispose();

      emit({ text: "foo" });
      expect(captured.length).toBe(0);
    }));

  test("remove()", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      const { listen, emit, remove } = createEventStack<[string]>();

      const listener = vi.fn();
      listen(listener);

      remove(listener);

      emit(["foo"]);
      expect(captured.length).toBe(0);

      const unsub = listen(listener);
      unsub();

      emit(["bar"]);
      expect(captured.length).toBe(0);

      dispose();
    }));

  test("has()", () =>
    createRoot(dispose => {
      const { listen, has } = createEventStack<[string]>();

      const listener = () => {};
      expect(has(listener)).toBe(false);
      const unsub = listen(listener);
      expect(has(listener)).toBe(true);
      unsub();
      expect(has(listener)).toBe(false);

      dispose();
    }));

  test("stack", () => {
    const { emit, stack, removeFromStack, setStack } = createEventStack<[string]>();

    expect(stack()).toEqual([]);

    emit(["foo"]);
    expect(stack()).toEqual([["foo"]]);

    const x: [string] = ["bar"];

    emit(x);
    expect(stack()).toEqual([["foo"], ["bar"]]);

    expect(removeFromStack(x)).toBe(true);
    expect(removeFromStack(["hello"])).toBe(false);
    expect(stack().length).toBe(1);

    const y: [string][] = [["0"], ["1"]];
    setStack(y);
    expect(stack()).toEqual(y);
  });

  test("stack is reactive", () =>
    createRoot(dispose => {
      const { emit, stack } = createEventStack<{ t: string }>();
      let captured: any;
      createComputed(() => {
        captured = stack();
      });

      expect(captured).toEqual([]);

      emit({ t: "foo" });
      expect(captured).toEqual([{ t: "foo" }]);

      emit({ t: "bar" });
      expect(captured).toEqual([{ t: "foo" }, { t: "bar" }]);

      dispose();
    }));

  test("config options", () =>
    createRoot(dispose => {
      let allowEmit = true;

      const { listen, has, remove, emit, stack } = createEventStack<string, { text: string }>({
        emitGuard: (emit, ...payload) => allowEmit && emit(...payload),
        toValue: e => ({ text: e })
      });
      const listener = () => {};

      listen(listener);
      remove(listener);
      expect(has(listener)).toBe(false);

      emit("foo");
      allowEmit = false;
      emit("bar");

      expect(stack()).toEqual([{ text: "foo" }]);

      dispose();
    }));
});
