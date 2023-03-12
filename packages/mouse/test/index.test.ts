import { createStaticStore } from "@solid-primitives/utils";
import { createRoot } from "solid-js";
import { describe, expect, it } from "vitest";

import { createMousePosition, createPositionToElement } from "../src";

describe("createMousePosition", () => {
  it("returns fallback", () =>
    createRoot(dispose => {
      const pos = createMousePosition();
      expect(pos).toEqual({
        x: 0,
        y: 0,
        sourceType: null,
        isInside: false,
      });
      dispose();
    }));

  it("initial values can be changed", () =>
    createRoot(dispose => {
      const pos = createMousePosition(undefined, {
        initialValue: { x: 69, y: 420 },
      });
      expect(pos).toEqual({
        x: 69,
        y: 420,
        sourceType: null,
        isInside: false,
      });
      dispose();
    }));
});

describe("createMouseToElement", () => {
  it("returns correct values", () =>
    createRoot(dispose => {
      const el = document.createElement("div");
      const [pos, setPos] = createStaticStore({ x: 0, y: 0 });
      const relative = createPositionToElement(el, () => pos);

      expect(relative).toEqual({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        isInside: true,
      });

      setPos({ x: -20, y: 30 });

      expect(relative).toEqual({
        x: -20,
        y: 30,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        isInside: false,
      });

      setPos({ x: 15 });

      expect(relative).toEqual({
        x: 15,
        y: 30,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        isInside: false,
      });

      dispose();
    }));

  it("initial values can be changed", () =>
    createRoot(dispose => {
      const pos = createPositionToElement(
        () => undefined,
        () => ({ x: 69, y: 420 }),
        {
          initialValue: {
            x: -1,
            y: 2,
            width: 3,
            height: 4,
            top: 5,
            left: 6,
          },
        },
      );

      expect(pos).toEqual({
        x: -1,
        y: 2,
        width: 3,
        height: 4,
        top: 5,
        left: 6,
        isInside: true,
      });

      dispose();
    }));
});
