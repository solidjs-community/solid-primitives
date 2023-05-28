import { createEffect, createRoot, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { describe, expect, test } from "vitest";
import { createFocusedGetter } from "../src";

describe("createFocusedGetter", () => {
  test("gets data from store by path", () =>
    createRoot(dispose => {
      const [store] = createStore({ message: "hello" });
      const message = createFocusedGetter(store, "message");
      expect(message()).toBe("hello");
      dispose();
    }));

  test("is reactive", () =>
    createRoot(dispose => {
      const [store, setStore] = createStore({ message: "hello" });
      const message = createFocusedGetter(store, "message");
      setStore("message", "goodbye");
      expect(message()).toBe("goodbye");
      dispose();
    }));

  test("works with createEffect", () =>
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

  test("composable with derived signals", () =>
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

  test("equivalent to derived signal", () =>
    createRoot(dispose => {
      const [store, setStore] = createStore({ foo: { bar: 1 } });
      const fooBarA = createFocusedGetter(store, "foo", "bar");
      const fooBarB = () => store.foo.bar;

      expect(fooBarA()).toEqual(fooBarB());

      setStore("foo", { bar: 2 });
      expect(fooBarA()).toEqual(fooBarB());

      dispose();
    }));

  test("works with top-level array", () =>
    createRoot(dispose => {
      const [store, setStore] = createStore([1, 2, 3]);
      const middleItem = createFocusedGetter(store, 1);

      expect(middleItem()).toBe(2);

      setStore([4, 5, 6]);
      expect(middleItem()).toBe(5);

      dispose();
    }));

  test("works with an accessor", () =>
    createRoot(dispose => {
      const [signal, setSignal] = createSignal({ foo: { bar: 1 } });
      const fooBar = createFocusedGetter(signal, "foo", "bar");

      expect(fooBar()).toBe(1);

      setSignal({ foo: { bar: 2 } });
      expect(fooBar()).toBe(2);

      dispose();
    }));
});
