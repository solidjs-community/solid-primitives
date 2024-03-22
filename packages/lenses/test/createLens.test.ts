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
});
