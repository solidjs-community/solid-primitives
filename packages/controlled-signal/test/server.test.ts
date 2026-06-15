import { describe, test, expect } from "vitest";
import {
  createControllableSignal,
  createControllableBooleanSignal,
  createControllableArraySignal,
  createControllableSetSignal,
} from "../src/index.js";

describe("createControllableSignal on server", () => {
  test("returns undefined without defaultValue", () => {
    const [value] = createControllableSignal<string>({});
    expect(value()).toBeUndefined();
  });

  test("returns defaultValue in uncontrolled mode", () => {
    const [value] = createControllableSignal({ defaultValue: () => "hello" });
    expect(value()).toBe("hello");
  });

  test("returns controlled value", () => {
    const [value] = createControllableSignal({ value: () => "world" });
    expect(value()).toBe("world");
  });

  test("controlled value takes precedence over defaultValue", () => {
    const [value] = createControllableSignal({
      value: () => "controlled",
      defaultValue: () => "default",
    });
    expect(value()).toBe("controlled");
  });

  test("undefined controlled value falls back to defaultValue", () => {
    const [value] = createControllableSignal({
      value: () => undefined,
      defaultValue: () => "fallback",
    });
    expect(value()).toBe("fallback");
  });

  test("setValue calls onChange synchronously", () => {
    let received: string | undefined;
    const [, setValue] = createControllableSignal<string>({
      defaultValue: () => "initial",
      onChange: v => {
        received = v;
      },
    });
    setValue("changed");
    expect(received).toBe("changed");
  });

  test("setValue does not call onChange when value is unchanged", () => {
    let callCount = 0;
    const [, setValue] = createControllableSignal<string>({
      defaultValue: () => "same",
      onChange: () => callCount++,
    });
    setValue("same");
    expect(callCount).toBe(0);
  });
});

describe("createControllableBooleanSignal on server", () => {
  test("returns false with no props", () => {
    const [value] = createControllableBooleanSignal({});
    expect(value()).toBe(false);
  });

  test("returns defaultValue when provided", () => {
    const [value] = createControllableBooleanSignal({ defaultValue: () => true });
    expect(value()).toBe(true);
  });

  test("returns controlled value", () => {
    const [value] = createControllableBooleanSignal({ value: () => true });
    expect(value()).toBe(true);
  });

  test("always returns a boolean (never undefined)", () => {
    const [value] = createControllableBooleanSignal({});
    expect(typeof value()).toBe("boolean");
  });
});

describe("createControllableArraySignal on server", () => {
  test("returns empty array with no props", () => {
    const [value] = createControllableArraySignal<string>({});
    expect(value()).toEqual([]);
  });

  test("returns defaultValue when provided", () => {
    const [value] = createControllableArraySignal({ defaultValue: () => ["a", "b"] });
    expect(value()).toEqual(["a", "b"]);
  });

  test("returns controlled value", () => {
    const [value] = createControllableArraySignal({ value: () => [1, 2, 3] });
    expect(value()).toEqual([1, 2, 3]);
  });

  test("always returns an array (never undefined)", () => {
    const [value] = createControllableArraySignal<string>({});
    expect(Array.isArray(value())).toBe(true);
  });
});

describe("createControllableSetSignal on server", () => {
  test("returns empty Set with no props", () => {
    const [value] = createControllableSetSignal<string>({});
    expect(value()).toEqual(new Set());
  });

  test("returns defaultValue when provided", () => {
    const [value] = createControllableSetSignal({ defaultValue: () => new Set(["a", "b"]) });
    expect(value()).toEqual(new Set(["a", "b"]));
  });

  test("returns controlled value", () => {
    const [value] = createControllableSetSignal({ value: () => new Set([1, 2]) });
    expect(value()).toEqual(new Set([1, 2]));
  });

  test("always returns a Set (never undefined)", () => {
    const [value] = createControllableSetSignal<string>({});
    expect(value()).toBeInstanceOf(Set);
  });
});
