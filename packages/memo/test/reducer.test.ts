import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { createReducer } from "../src";

describe("createReducer", () => {
  test("reducer works", () =>
    createRoot(dispose => {
      const initialValue = 1;
      const numberOfDoubles = 3;

      const [counter, doubleCounter] = createReducer(counter => counter * 2, initialValue);

      let expectedCounter = initialValue;

      for (let i = 0; i < numberOfDoubles; i++) {
        doubleCounter();
        expectedCounter *= 2;
      }

      expect(counter()).toEqual(expectedCounter);

      dispose();
    }));
});
