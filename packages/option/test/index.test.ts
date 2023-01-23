import { createRoot } from "solid-js";
import { describe, test, expect } from "vitest";
import { createOption, makeOption, None, Some } from "../src";

describe("new Option", () => {
  test("create new None Option", () => {
    const option = makeOption<number>(null);
    expect(option.isNone(), "option.isNone() should return true").toBe(true);
    expect(option.isSome(), "option.isSome() should return false").toBe(false);
    expect(option.unwrap(), "option.unwrap() should return null").toBe(null);
    expect(option.unwrap_or(1), "option.unwrap_or(1) should return 1").toBe(1);
    expect(
      option.unwrap_or_else(() => 2),
      "option.unwrap_or_else(() => 2) should return 2"
    ).toBe(2);
    expect(option.map(opt => opt * 2).isNone(), "option.map() should return None variant").toBe(
      true
    );
    expect(option.or(makeOption(1)).unwrap(), "option.or(Some(1)) should return Some(1)").toBe(1);
  });
  test("create new Some Option", () => {
    const option = makeOption(2);
    expect(option.isNone(), "option.isNone() should return false").toBe(false);
    expect(option.isSome(), "option.isSome() should return true").toBe(true);
    expect(option.unwrap(), "option.unwrap() should return 2").toBe(2);
    expect(option.unwrap_or(1), "option.unwrap_or(1) should return 2").toBe(2);
    expect(
      option.unwrap_or_else(() => 1),
      "option.unwrap_or_else(() => 1) should return 2"
    ).toBe(2);
    expect(option.map(opt => opt * 2).unwrap(), "option.map() should return Some(4) variant").toBe(
      4
    );
    expect(option.or(makeOption(1)).unwrap(), "option.or(Some(1)) should return Some(2)").toBe(2);
  });
  test("create option with Some/None", () => {
    const someOption = Some(1);
    expect(someOption.unwrap(), "someOption.unwrap() should return 1").toBe(1);
    const noneOption = None<number>();
    expect(noneOption.unwrap(), "noneOption.unwrap() should return null").toBe(null);
  });
  test("createOption reactive option", () => {
    createRoot(dispose => {
      const [option, setOption] = createOption(1);
      expect(option().unwrap(), "option.unwrap() should return 1").toBe(1);
      setOption(None<number>());
      expect(option().unwrap(), "option.unwrap() should return null").toBe(null);
      dispose();
    });
  });
});
