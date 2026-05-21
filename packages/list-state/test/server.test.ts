import { describe, expect, it, vi } from "vitest";
import { createRoot } from "solid-js";
import { createListState, createMultiSelectListState } from "../src/index.js";

describe("createListState - SSR safety", () => {
  it("creates list state without errors", () => {
    createRoot((dispose) => {
      const { active } = createListState({
        items: ["a", "b", "c"],
        initialActive: "a",
      });
      expect(active()).toBe("a");
      dispose();
    });
  });

  it("supports all configuration options in SSR", () => {
    createRoot((dispose) => {
      const { active } = createListState({
        items: ["a", "b", "c"],
        initialActive: "a",
        orientation: "horizontal",
        loop: false,
        textDirection: "rtl",
        handleTab: true,
        vimMode: true,
        vimKeys: { up: "w", down: "s", left: "a", right: "d" },
      });
      expect(active()).toBe("a");
      dispose();
    });
  });

  it("handles accessor functions in SSR", () => {
    createRoot((dispose) => {
      const { active } = createListState({
        items: () => ["a", "b", "c"],
        initialActive: "a",
      });
      expect(active()).toBe("a");
      dispose();
    });
  });

  it("onKeyDown handler exists in SSR", () => {
    createRoot((dispose) => {
      const { onKeyDown } = createListState({
        items: ["a", "b", "c"],
        initialActive: "a",
      });
      expect(typeof onKeyDown).toBe("function");
      dispose();
    });
  });

  it("handles empty items in SSR", () => {
    createRoot((dispose) => {
      const { active } = createListState({
        items: [],
      });
      expect(active()).toBe(null);
      dispose();
    });
  });

  it("supports callback in SSR", () => {
    createRoot((dispose) => {
      const onChange = vi.fn();
      const { onKeyDown } = createListState({
        items: ["a", "b", "c"],
        initialActive: "a",
        onActiveChange: onChange,
      });
      expect(typeof onKeyDown).toBe("function");
      dispose();
    });
  });
});

describe("createMultiSelectListState - SSR safety", () => {
  it("creates multi-select list state without errors", () => {
    createRoot((dispose) => {
      const { cursor, active, selected } = createMultiSelectListState({
        items: ["a", "b", "c"],
        initialCursor: "a",
        initialActive: ["a"],
        initialSelected: ["a"],
      });
      expect(cursor()).toBe("a");
      expect(active()).toEqual(["a"]);
      expect(selected()).toEqual(["a"]);
      dispose();
    });
  });

  it("handles cursor and selection state in SSR", () => {
    createRoot((dispose) => {
      const { cursor, active, selected, setCursorActive } =
        createMultiSelectListState({
          items: ["a", "b", "c"],
        });
      setCursorActive("b");
      expect(cursor()).toBe("b");
      expect(active()).toEqual(["b"]);
      expect(selected()).toEqual([]);
      dispose();
    });
  });

  it("supports all configuration options in SSR", () => {
    createRoot((dispose) => {
      const { cursor } = createMultiSelectListState({
        items: ["a", "b", "c"],
        initialCursor: "a",
        initialActive: ["a"],
        initialSelected: ["a"],
        orientation: "horizontal",
        loop: false,
        textDirection: "rtl",
        handleTab: true,
        vimMode: true,
        vimKeys: { up: "w", down: "s", left: "a", right: "d" },
        onCursorChange: () => {},
        onActiveChange: () => {},
        onSelectedChange: () => {},
      });
      expect(cursor()).toBe("a");
      dispose();
    });
  });

  it("handles accessor functions in SSR", () => {
    createRoot((dispose) => {
      const { cursor } = createMultiSelectListState({
        items: () => ["a", "b", "c"],
        initialCursor: "a",
      });
      expect(cursor()).toBe("a");
      dispose();
    });
  });

  it("onKeyDown handler exists in SSR", () => {
    createRoot((dispose) => {
      const { onKeyDown } = createMultiSelectListState({
        items: ["a", "b", "c"],
      });
      expect(typeof onKeyDown).toBe("function");
      dispose();
    });
  });

  it("handles empty items in SSR", () => {
    createRoot((dispose) => {
      const { cursor } = createMultiSelectListState({
        items: [],
      });
      expect(cursor()).toBe(null);
      dispose();
    });
  });

  it("supports callbacks in SSR", () => {
    createRoot((dispose) => {
      const onCursorChange = vi.fn();
      const onActiveChange = vi.fn();
      const onSelectedChange = vi.fn();
      const { onKeyDown } = createMultiSelectListState({
        items: ["a", "b", "c"],
        onCursorChange,
        onActiveChange,
        onSelectedChange,
      });
      expect(typeof onKeyDown).toBe("function");
      dispose();
    });
  });
});
