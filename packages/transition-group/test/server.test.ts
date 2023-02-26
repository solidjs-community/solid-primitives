import { describe, test, expect } from "vitest";
import { createSwitchTransition, createListTransition } from "../src";

const el1 = { t: "<div>1</div>" };
const el2 = { t: "<div>2</div>" };

describe("createSwitchTransition", () => {
  test("returns initial elements", () => {
    const result = createSwitchTransition(() => el1, {});
    expect(result()).toHaveLength(1);
    expect(result()[0]).toBe(el1);
  });
});

describe("createListTransition", () => {
  test("returns initial elements", () => {
    const result = createListTransition(() => [el1, el2], {
      onChange: () => {},
    });
    expect(result()).toHaveLength(2);
    expect(result()[0]).toBe(el1);
    expect(result()[1]).toBe(el2);
  });
});
