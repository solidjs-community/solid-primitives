import { describe, test } from "vitest";
import { createRoot } from "solid-js";
import { createMachine } from "../src";

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
