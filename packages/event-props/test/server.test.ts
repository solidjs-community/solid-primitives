import { describe, expect, it } from "vitest";
import { createEventProps } from "../src/index.js";

describe("event-props (server)", () => {
  it("createEventProps returns a store and event props", () => {
    const [store, props] = createEventProps("click", "mousemove");
    expect(typeof props.onclick).toBe("function");
    expect(typeof props.onmousemove).toBe("function");
    expect(store.click).toBe(undefined);
    expect(store.mousemove).toBe(undefined);
  });
});
