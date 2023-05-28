import { createEffect, createRoot, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { describe, expect, test } from "vitest";
import { createFocusedGetter } from "../src";

describe("createFocusedGetter", () => {
  test("should get data from store by path", () =>
    createRoot(dispose => {
      const [store] = createStore({ message: "hello" });
      const message = createFocusedGetter(store, "message");
      expect(message()).toBe("hello");
      dispose();
    }));

  test("getter should be reactive", () =>
    createRoot(dispose => {
      const [store, setStore] = createStore({ message: "hello" });
      const message = createFocusedGetter(store, "message");
      setStore("message", "goodbye");
      expect(message()).toBe("goodbye");
      dispose();
    }));

  test("getter should work with createEffect", () =>
    createRoot(dispose => {
      const [store, setStore] = createStore({ message: "hello" });
      const message = createFocusedGetter(store, "message");

      setStore("message", "goodbye");
      return new Promise<void>(resolve =>
        createEffect(() => {
          expect(message()).toEqual("goodbye");
          dispose();
          resolve();
        }),
      );
    }));

  test("getter should be composable with derived signals", () =>
    createRoot(dispose => {
      const [store, setStore] = createStore({ greeting: "hello" });
      const greeting = createFocusedGetter(store, "greeting");
      const [name, setName] = createSignal("wilfred");

      const message = () => `${greeting()} ${name()}`;
      expect(message()).toBe("hello wilfred");

      setStore("greeting", "goodbye");
      expect(message()).toBe("goodbye wilfred");

      setName("wilma");
      expect(message()).toBe("goodbye wilma");

      dispose();
    }));

  test("getter is equivalent to a derived signal", () =>
    createRoot(dispose => {
      const [store, setStore] = createStore({ foo: { bar: 1 } });
      const fooBarA = createFocusedGetter(store, "foo", "bar");
      const fooBarB = () => store.foo.bar;

      expect(fooBarA()).toEqual(fooBarB());

      setStore("foo", { bar: 2 });
      expect(fooBarA()).toEqual(fooBarB());

      dispose();
    }));

  test("getter works with top-level array", () =>
    createRoot(dispose => {
      const [store, setStore] = createStore([1, 2, 3]);
      const middleItem = createFocusedGetter(store, 1);

      expect(middleItem()).toBe(2);

      setStore([4, 5, 6]);
      expect(middleItem()).toBe(5);

      dispose();
    }));
});
