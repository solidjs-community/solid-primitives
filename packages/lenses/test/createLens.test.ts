import { createRoot } from "solid-js";
import { createStore } from "solid-js/store";
import { describe, expect, test } from "vitest";
import { createLens } from "../src";

describe("createLens", () => {
  test("is defined", () =>
    createRoot(dispose => {
      expect(createLens).toBeDefined();
      dispose();
    }));

  test("returns a getter and setter", () =>
    createRoot(dispose => {
      const store = createStore([{ message: "hello world" }]);
      const [get, set] = createLens(store, 0);
      expect(get).toBeDefined();
      expect(set).toBeDefined();
      dispose();
    }));

  test("setter modifies the original store object", () =>
    createRoot(dispose => {
      const [store, setStore] = createStore<{ message: string }[]>([{ message: "hello world" }]);
      const [, set] = createLens([store, setStore], 0);
      set("message", "goodbye world");
      expect(store[0]!.message).toBe("goodbye world");
      dispose();
    }));

  test("is composable", () =>
    createRoot(dispose => {
      const [store, setStore] = createStore([
        {
          inner: {
            innerString: "first",
            innerNumber: 0,
          },
        },
      ]);
      const [inner, setInner] = createLens([store, setStore], 0, "inner");
      const [, setInnerString] = createLens([inner, setInner], "innerString");

      // Use the composed lens
      setInnerString("new first");
      expect(store[0]!.inner.innerString).toBe("new first");
      expect(store[0]!.inner.innerNumber).toBe(0); // unchanged by `setInnerString`

      // Use the "top-level" lens
      setInner({
        innerString: "even newer first",
        innerNumber: -1,
      });
      expect(store[0]!.inner.innerString).toBe("even newer first");
      expect(store[0]!.inner.innerNumber).toBe(-1);

      // Use the original setStore function
      setStore(0, "inner", "innerString", "newest first ever");
      expect(store[0]!.inner.innerString).toBe("newest first ever");
      expect(store[0]!.inner.innerNumber).toBe(-1); // unchanged by `setStore`

      dispose();
    }));
});
