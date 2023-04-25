import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { createMarker, makeSearchRegex } from "../src";

describe("makeSearchRegex", () => {
  test("empty string", () => {
    expect(makeSearchRegex("").test("hello")).toBe(false);
    expect(makeSearchRegex("").test("")).toBe(false);
  });

  test("is case-insensitive", () => {
    expect(makeSearchRegex("Abc").test("hello ABC")).toBe(true);
    expect(makeSearchRegex("Abc").test("aabcc")).toBe(true);
    expect(makeSearchRegex("Abc").test("a b c")).toBe(false);
  });

  test("matches multiple words", () => {
    expect(makeSearchRegex("abc def").test("hello abc def")).toBe(true);
    expect(makeSearchRegex("abc def").test("hello abc")).toBe(true);
    expect(makeSearchRegex("abc def").test("hello def")).toBe(true);
    expect(makeSearchRegex("abc def").test("hello abc def ghi")).toBe(true);
    expect(makeSearchRegex("abc def").test("hello")).toBe(false);
  });

  test("ignores non-word characters", () => {
    expect(makeSearchRegex("a.bc").test("abc")).toBe(true);
    expect(makeSearchRegex("a.bc").test("a.bc")).toBe(false);
  });

  test("trims search", () => {
    expect(makeSearchRegex("   abc   ").test("abc")).toBe(true);
    expect(makeSearchRegex("   abc   ").test("hello abc")).toBe(true);
  });
});

describe("createMarker", () => {
  test("marking test", () =>
    createRoot(dispose => {
      const mark = createMarker(text => text);

      const result = mark("Hello world!", /\w+/g);

      expect(result).toEqual([expect.any(Function), " ", expect.any(Function), "!"]);

      expect((result[0] as Function)()).toBe("Hello");
      expect((result[2] as Function)()).toBe("world");

      dispose();
    }));

  test("empty regex", () => {
    createRoot(dispose => {
      const mark = createMarker(text => text);
      const result = mark("Hello world!", new RegExp(""));

      expect(result).toEqual(["Hello world!"]);

      dispose();
    });
  });

  test("empty string", () => {
    createRoot(dispose => {
      const mark = createMarker(text => text);
      const result = mark("", /\w+/g);

      expect(result).toEqual([""]);

      dispose();
    });
  });

  test("no matches", () => {
    createRoot(dispose => {
      const mark = createMarker(text => text);
      const result = mark("Hello world!", /a/g);

      expect(result).toEqual(["Hello world!"]);

      dispose();
    });
  });

  test("matching multiple times", () => {
    createRoot(dispose => {
      const mark = createMarker(text => text);
      const result1 = mark("Hello world!", /l/g);

      expect(result1).toEqual([
        "He",
        expect.any(Function),
        expect.any(Function),
        "o wor",
        expect.any(Function),
        "d!",
      ]);
      expect((result1[1] as Function)()).toBe("l");
      expect((result1[2] as Function)()).toBe("l");
      expect((result1[4] as Function)()).toBe("l");

      const result2 = mark("Hello world!", /\w+/g);

      expect(result2).toEqual([expect.any(Function), " ", expect.any(Function), "!"]);
      expect((result2[0] as Function)()).toBe("Hello");
      expect((result2[2] as Function)()).toBe("world");

      dispose();
    });
  });

  test("element caching", () => {
    createRoot(dispose => {
      let count = 0;
      const mark = createMarker(text => {
        count++;
        return text;
      });

      createRoot(dispose => {
        const result = mark("Hello world!", /\w+/g);
        expect(result).toEqual([expect.any(Function), " ", expect.any(Function), "!"]);
        expect((result[0] as Function)()).toBe("Hello");
        expect((result[2] as Function)()).toBe("world");
        dispose();
      });
      createRoot(dispose => {
        const result = mark("Hello solid!", /\w+/g);
        expect(result).toEqual([expect.any(Function), " ", expect.any(Function), "!"]);
        expect((result[0] as Function)()).toBe("Hello");
        expect((result[2] as Function)()).toBe("solid");
        dispose();
      });

      expect(count).toBe(2);

      dispose();
    });
  });
});
