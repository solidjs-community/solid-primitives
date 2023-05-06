import { describe, test, expect } from "vitest";
import { createUserTheme } from "../src";

describe("createUserTheme", () => {
  test("doesn't break in SSR", () => {
    const [theme, setTheme] = createUserTheme("dark");
    expect(theme(), "initial value should be true").toBe("dark");
  });
});
