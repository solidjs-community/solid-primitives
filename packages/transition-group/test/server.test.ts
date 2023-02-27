import { describe, it, expect } from "vitest";
import { createSwitchTransition, createListTransition } from "../src";

const el1 = { t: "<div>1</div>" };
const el2 = { t: "<div>2</div>" };

describe("createSwitchTransition", () => {
  it("returns initial elements", () => {
    const result = createSwitchTransition(() => el1, {});
    expect(result()).toHaveLength(1);
    expect(result()[0]).toBe(el1);
  });

  it("returns initial elements if appear is enabled", () => {
    const result = createSwitchTransition(() => el1, { appear: true });
    expect(result()).toHaveLength(1);
    expect(result()[0]).toBe(el1);
  });
});

describe("createListTransition", () => {
  it("returns initial elements", () => {
    const result = createListTransition(() => [el1, el2], {
      onChange: () => {},
    });
    expect(result()).toHaveLength(2);
    expect(result()[0]).toBe(el1);
    expect(result()[1]).toBe(el2);
  });

  it("returns initial elements if appear is enabled", () => {
    const result = createListTransition(() => [el1, el2], {
      onChange: () => {},
      appear: true,
    });
    expect(result()).toHaveLength(2);
    expect(result()[0]).toBe(el1);
    expect(result()[1]).toBe(el2);
  });
});
