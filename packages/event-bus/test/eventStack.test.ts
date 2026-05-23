import { describe, test, expect } from "vitest";
import { createRoot, flush } from "solid-js";
import { createEventStack } from "../src/index.js";

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
      flush();
      expect(captured[0]).toBe("foo");
      expect(capturedStack.length).toBe(1);
      expect(value().length).toBe(1);

      emit(["bar"]);
      flush();
      expect(captured[1]).toBe("bar");
      expect(capturedStack.length).toBe(2);
      expect(value().length).toBe(2);

      allowRemove = true;
      emit(["baz"]);
      flush();
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
    flush();
    expect(value()).toEqual([["foo"]]);

    const x: [string] = ["bar"];

    emit(x);
    flush();
    expect(value()).toEqual([["foo"], ["bar"]]);

    expect(remove(x)).toBe(true);
    flush();
    expect(remove(["hello"])).toBe(false);
    expect(value().length).toBe(1);

    const y: [string][] = [["0"], ["1"]];
    setValue(y);
    flush();
    expect(value()).toEqual(y);
  });

  test("stack is reactive", () =>
    createRoot(dispose => {
      const { emit, value } = createEventStack<{ t: string }>();

      expect(value()).toEqual([]);

      emit({ t: "foo" });
      flush();
      expect(value()).toEqual([{ t: "foo" }]);

      emit({ t: "bar" });
      flush();
      expect(value()).toEqual([{ t: "foo" }, { t: "bar" }]);

      dispose();
    }));
});
