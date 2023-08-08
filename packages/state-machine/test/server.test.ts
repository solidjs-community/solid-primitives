import { describe, test } from "vitest";
import { createRoot } from "solid-js";
import { createMachine } from "../src/index.js";

describe("createMachine", () => {
  test("works", () =>
    createRoot(() => {
      createMachine<{
        idle: { value: "foo" };
        loading: { value: "bar" };
      }>({
        initial: "idle",
        states: {
          idle: () => "foo",
          loading: () => "bar",
        },
      });
    }));
});
