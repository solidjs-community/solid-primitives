import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { createMarker } from "../src";

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
