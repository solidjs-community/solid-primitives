import { describe, test, expect } from "vitest";
import { createRoot, createComputed } from "solid-js";
import { createEventBus } from "../src";

describe("createEventBus", () => {
  test("emitting and listening", () => {
    const captured: any[] = [];
    const { listen, emit } = createEventBus<string>();

    listen((e, prev) => captured.push([e, prev]));

    emit("foo");
    expect(captured[0]).toEqual(["foo", undefined]);

    emit("bar");
    expect(captured[1]).toEqual(["bar", "foo"]);
  });

  test("clear function", () => {
    const captured: any[] = [];
    const { listen, emit, clear } = createEventBus<string>();

    listen(a => captured.push(a));

    clear();

    emit("foo");
    expect(captured.length).toBe(0);
  });

  test("clears on dispose", () =>
    createRoot(dispose => {
      const captured: any[] = [];
      const { listen, emit } = createEventBus<string>();

      listen(a => captured.push(a));

      dispose();

      emit("foo");
      expect(captured.length).toBe(0);
    }));

  test("remove()", () => {
    const captured: any[] = [];
    const { listen, emit, remove } = createEventBus<string>();

    const listener = (a: string) => captured.push(a);
    listen(listener);

    remove(listener);

    emit("foo");
    expect(captured).toEqual([]);

    const unsub = listen(listener);
    unsub();

    emit("bar");
    expect(captured).toEqual([]);
  });

  test("remove protected", () => {
    const captured: any[] = [];
    const { listen, emit, remove } = createEventBus<string>();

    const listener = (a: string) => captured.push(a);
    const unsub = listen(listener, true);

    remove(listener);

    emit("foo");
    expect(captured, "normal remove() shouldn't remove a protected listener").toEqual(["foo"]);

    unsub();

    emit("bar");
    expect(captured, "returned unsub func should remove a protected listener").toEqual(["foo"]);
  });

  test("has()", () => {
    const { listen, has } = createEventBus<string>();

    const listener = () => {};
    expect(has(listener)).toBe(false);
    const unsub = listen(listener);
    expect(has(listener)).toBe(true);
    unsub();
    expect(has(listener)).toBe(false);
  });

  test("last value", () => {
    const { emit, value } = createEventBus<string>();

    expect(value()).toBe(undefined);

    emit("foo");
    expect(value()).toBe("foo");

    emit("bar");
    expect(value()).toBe("bar");
  });

  test("value is reactive", () =>
    createRoot(dispose => {
      const { emit, value } = createEventBus<string>();
      const captured: any[] = [];
      createComputed(() => {
        captured.push(value());
      });

      expect(captured).toEqual([undefined]);

      emit("foo");
      expect(captured).toEqual([undefined, "foo"]);

      emit("bar");
      expect(captured).toEqual([undefined, "foo", "bar"]);

      dispose();
    }));

  test("config options", () =>
    createRoot(dispose => {
      let allowEmit = true;
      let allowRemove = false;

      const capturedBeforeEmit: any[] = [];

      const { listen, has, remove, emit, value } = createEventBus<string>({
        beforeEmit: a => capturedBeforeEmit.push(a),
        emitGuard: (emit, ...payload) => {
          allowEmit && emit(...payload);
        },
        removeGuard: remove => allowRemove && remove(),
        value: "initial"
      });
      const listener = () => {};

      expect(value()).toBe("initial");

      let unsub = listen(listener);
      remove(listener);
      expect(has(listener)).toBe(true);
      unsub();
      expect(has(listener)).toBe(false);

      listen(listener);
      allowRemove = true;
      remove(listener);
      expect(has(listener)).toBe(false);

      emit("foo");
      expect(capturedBeforeEmit).toEqual(["foo"]);
      allowEmit = false;
      emit("bar");
      expect(capturedBeforeEmit).toEqual(["foo"]);

      dispose();
    }));
});
