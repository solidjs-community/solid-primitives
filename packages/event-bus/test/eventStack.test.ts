import { describe, test, expect } from "vitest";
import { createComputed, createRoot } from "solid-js";
import { createEventStack } from "../src";

describe("createEventStack", () => {
  test("emitting and listening", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      let capturedStack: any[] = [];
      let allowRemove = false;

      const { listen, emit, value } = createEventStack<[string]>();

      listen(({ event, stack, remove }) => {
        captured.push(event[0]);
        capturedStack = stack;
        if (allowRemove) remove();
      });

      emit(["foo"]);
      expect(captured[0]).toBe("foo");
      expect(capturedStack.length).toBe(1);
      expect(value().length).toBe(1);

      emit(["bar"]);
      expect(captured[1]).toBe("bar");
      expect(capturedStack.length).toBe(2);
      expect(value().length).toBe(2);

      allowRemove = true;
      emit(["baz"]);
      expect(captured[2]).toBe("baz");
      expect(capturedStack.length).toBe(3);
      expect(value().length).toBe(2);

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

  test("stack", () => {
    const { emit, value, remove, setValue } = createEventStack<[string]>();

    expect(value()).toEqual([]);

    emit(["foo"]);
    expect(value()).toEqual([["foo"]]);

    const x: [string] = ["bar"];

    emit(x);
    expect(value()).toEqual([["foo"], ["bar"]]);

    expect(remove(x)).toBe(true);
    expect(remove(["hello"])).toBe(false);
    expect(value().length).toBe(1);

    const y: [string][] = [["0"], ["1"]];
    setValue(y);
    expect(value()).toEqual(y);
  });

  test("stack is reactive", () =>
    createRoot(dispose => {
      const { emit, value } = createEventStack<{ t: string }>();
      let captured: any;
      createComputed(() => {
        captured = value();
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

      const { emit, value } = createEventStack<string, { text: string }>({
        emitGuard: (emit, ...payload) => allowEmit && emit(...payload),
        toValue: e => ({ text: e })
      });

      emit("foo");
      allowEmit = false;
      emit("bar");

      expect(value()).toEqual([{ text: "foo" }]);

      dispose();
    }));
});
