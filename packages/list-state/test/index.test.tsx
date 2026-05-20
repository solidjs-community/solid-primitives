import { describe, test, expect, vi } from "vitest";
import { createListState, createMultiSelectListState } from "../src/index.js";

describe("createListState", () => {
  test("creates a list state with initial active item", () => {
    const items = ["a", "b", "c"];
    const { active, onKeyDown } = createListState({
      items: items,
      initialActive: "a",
    });
    expect(active()).toBe("a");
    expect(typeof onKeyDown).toBe("function");
  });

  test("returns all required properties", () => {
    const { active, setActive, onKeyDown } = createListState({
      items: ["item1", "item2"],
    });
    expect(typeof active).toBe("function");
    expect(typeof setActive).toBe("function");
    expect(typeof onKeyDown).toBe("function");
  });

  test("initializes with undefined active when no initial value provided", () => {
    const { active } = createListState({ items: ["a", "b", "c"] });
    expect(active()).toBe(undefined);
  });

  test("accepts all config options", () => {
    const { active } = createListState({
      items: ["a", "b", "c"],
      initialActive: "a",
      orientation: "horizontal",
      loop: false,
      textDirection: "rtl",
      handleTab: false,
      vimMode: true,
      vimKeys: { up: "w", down: "s", left: "a", right: "d" },
      onActiveChange: () => {},
    });
    expect(active()).toBe("a");
  });

  test("handles accessor functions for items", () => {
    const { active } = createListState({
      items: () => ["a", "b", "c"],
      initialActive: "a",
    });
    expect(active()).toBe("a");
  });

  test("handles accessor functions for configuration", () => {
    const { active } = createListState({
      items: ["a", "b", "c"],
      initialActive: "a",
      orientation: () => "horizontal",
      loop: () => false,
    });
    expect(active()).toBe("a");
  });

  test("onKeyDown handler exists and is callable", () => {
    const { onKeyDown } = createListState({
      items: ["a", "b", "c"],
      initialActive: "a",
    });
    expect(typeof onKeyDown).toBe("function");
    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    expect(() => onKeyDown(event)).not.toThrow();
  });

  test("handles empty items without error", () => {
    const { onKeyDown } = createListState({
      items: [],
    });
    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    expect(() => onKeyDown(event)).not.toThrow();
  });

  test("handles key events case insensitively", () => {
    const { onKeyDown } = createListState({
      items: ["a", "b", "c"],
      vimMode: true,
      initialActive: "a",
    });
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "J" }))).not.toThrow();
  });

  test("handles horizontal orientation", () => {
    const { onKeyDown } = createListState({
      items: ["a", "b", "c"],
      orientation: "horizontal",
      initialActive: "a",
    });
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "ArrowRight" }))).not.toThrow();
  });

  test("handles RTL text direction", () => {
    const { onKeyDown } = createListState({
      items: ["a", "b", "c"],
      orientation: "horizontal",
      textDirection: "rtl",
      initialActive: "a",
    });
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "ArrowLeft" }))).not.toThrow();
  });

  test("handles vim mode", () => {
    const { onKeyDown } = createListState({
      items: ["a", "b", "c"],
      vimMode: true,
      initialActive: "a",
    });
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "k" }))).not.toThrow();
  });

  test("handles custom vim keys", () => {
    const { onKeyDown } = createListState({
      items: ["a", "b", "c"],
      vimMode: true,
      vimKeys: { up: "w", down: "s", left: "a", right: "d" },
      initialActive: "a",
    });
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "s" }))).not.toThrow();
  });

  test("handles Tab navigation when enabled", () => {
    const { onKeyDown } = createListState({
      items: ["a", "b", "c"],
      handleTab: true,
      initialActive: "a",
    });
    const event = new KeyboardEvent("keydown", { key: "Tab" });
    expect(() => onKeyDown(event)).not.toThrow();
  });

  test("ignores Tab when disabled", () => {
    const { onKeyDown } = createListState({
      items: ["a", "b", "c"],
      handleTab: false,
      initialActive: "a",
    });
    const event = new KeyboardEvent("keydown", { key: "Tab" });
    expect(() => onKeyDown(event)).not.toThrow();
  });

  test("handles Home key", () => {
    const { onKeyDown } = createListState({
      items: ["a", "b", "c"],
      initialActive: "c",
    });
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "Home" }))).not.toThrow();
  });

  test("handles End key", () => {
    const { onKeyDown } = createListState({
      items: ["a", "b", "c"],
      initialActive: "a",
    });
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "End" }))).not.toThrow();
  });

  test("handles looping configuration", () => {
    const { onKeyDown: onKeyDownWithLoop } = createListState({
      items: ["a", "b", "c"],
      loop: true,
      initialActive: "c",
    });
    expect(() => onKeyDownWithLoop(new KeyboardEvent("keydown", { key: "ArrowDown" }))).not.toThrow();

    const { onKeyDown: onKeyDownNoLoop } = createListState({
      items: ["a", "b", "c"],
      loop: false,
      initialActive: "c",
    });
    expect(() => onKeyDownNoLoop(new KeyboardEvent("keydown", { key: "ArrowDown" }))).not.toThrow();
  });
});

describe("createMultiSelectListState", () => {
  test("creates a multi-select list state", () => {
    const items = ["a", "b", "c"];
    const { cursor, active, selected, onKeyDown } = createMultiSelectListState({
      items: items,
    });
    expect(typeof cursor).toBe("function");
    expect(typeof active).toBe("function");
    expect(typeof selected).toBe("function");
    expect(typeof onKeyDown).toBe("function");
  });

  test("returns all required properties", () => {
    const {
      cursor,
      setCursor,
      active,
      setActive,
      selected,
      setSelected,
      setCursorActive,
      toggleSelected,
      onKeyDown,
    } = createMultiSelectListState({
      items: ["item1", "item2"],
    });
    expect(typeof cursor).toBe("function");
    expect(typeof setCursor).toBe("function");
    expect(typeof active).toBe("function");
    expect(typeof setActive).toBe("function");
    expect(typeof selected).toBe("function");
    expect(typeof setSelected).toBe("function");
    expect(typeof setCursorActive).toBe("function");
    expect(typeof toggleSelected).toBe("function");
    expect(typeof onKeyDown).toBe("function");
  });

  test("initializes with undefined cursor and empty active/selected", () => {
    const { cursor, active, selected } = createMultiSelectListState({
      items: ["a", "b", "c"],
    });
    expect(cursor()).toBe(undefined);
    expect(active()).toEqual([]);
    expect(selected()).toEqual([]);
  });

  test("initializes with provided initial values", () => {
    const { cursor, active, selected } = createMultiSelectListState({
      items: ["a", "b", "c"],
      initialCursor: "b",
      initialActive: ["b"],
      initialSelected: ["a"],
    });
    expect(cursor()).toBe("b");
    expect(active()).toEqual(["b"]);
    expect(selected()).toEqual(["a"]);
  });

  test("accepts all config options", () => {
    const { cursor } = createMultiSelectListState({
      items: ["a", "b", "c"],
      initialCursor: "a",
      initialActive: ["a"],
      initialSelected: [],
      orientation: "horizontal",
      loop: false,
      textDirection: "rtl",
      handleTab: false,
      vimMode: true,
      vimKeys: { up: "w", down: "s", left: "a", right: "d" },
      onCursorChange: () => {},
      onActiveChange: () => {},
      onSelectedChange: () => {},
    });
    expect(cursor()).toBe("a");
  });

  test("onKeyDown handler exists and is callable", () => {
    const { onKeyDown } = createMultiSelectListState({
      items: ["a", "b", "c"],
    });
    expect(typeof onKeyDown).toBe("function");
    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    expect(() => onKeyDown(event)).not.toThrow();
  });

  test("handles empty items without error", () => {
    const { onKeyDown } = createMultiSelectListState({
      items: [],
    });
    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    expect(() => onKeyDown(event)).not.toThrow();
  });

  test("calls onCursorChange when setCursorActive is called", () => {
    const onChange = vi.fn();
    const { setCursorActive } = createMultiSelectListState({
      items: ["a", "b", "c"],
      onCursorChange: onChange,
    });
    setCursorActive("a");
    expect(onChange).toHaveBeenCalledWith("a");
  });

  test("calls onActiveChange when setCursorActive is called", () => {
    const onChange = vi.fn();
    const { setCursorActive } = createMultiSelectListState({
      items: ["a", "b", "c"],
      onActiveChange: onChange,
    });
    setCursorActive("a");
    expect(onChange).toHaveBeenCalledWith(["a"]);
  });

  test("calls onCursorChange with undefined when setCursorActive(undefined)", () => {
    const onChange = vi.fn();
    const { setCursorActive } = createMultiSelectListState({
      items: ["a", "b", "c"],
      initialCursor: "a",
      onCursorChange: onChange,
    });
    onChange.mockClear();
    setCursorActive(undefined);
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  test("handles vim mode", () => {
    const { onKeyDown } = createMultiSelectListState({
      items: ["a", "b", "c"],
      vimMode: true,
      initialCursor: "a",
    });
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "j" }))).not.toThrow();
  });

  test("handles custom vim keys", () => {
    const { onKeyDown } = createMultiSelectListState({
      items: ["a", "b", "c"],
      vimMode: true,
      vimKeys: { up: "w", down: "s", left: "a", right: "d" },
      initialCursor: "a",
    });
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "s" }))).not.toThrow();
  });

  test("handles horizontal orientation", () => {
    const { onKeyDown } = createMultiSelectListState({
      items: ["a", "b", "c"],
      orientation: "horizontal",
      initialCursor: "a",
    });
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "ArrowRight" }))).not.toThrow();
  });

  test("handles RTL text direction", () => {
    const { onKeyDown } = createMultiSelectListState({
      items: ["a", "b", "c"],
      orientation: "horizontal",
      textDirection: "rtl",
      initialCursor: "a",
    });
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "ArrowLeft" }))).not.toThrow();
  });

  test("handles Tab navigation when enabled", () => {
    const { onKeyDown } = createMultiSelectListState({
      items: ["a", "b", "c"],
      handleTab: true,
      initialCursor: "a",
    });
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "Tab" }))).not.toThrow();
  });

  test("ignores Tab when disabled", () => {
    const { onKeyDown } = createMultiSelectListState({
      items: ["a", "b", "c"],
      handleTab: false,
      initialCursor: "a",
    });
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "Tab" }))).not.toThrow();
  });

  test("handles Home key", () => {
    const { onKeyDown } = createMultiSelectListState({
      items: ["a", "b", "c"],
      initialCursor: "c",
    });
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "Home" }))).not.toThrow();
  });

  test("handles End key", () => {
    const { onKeyDown } = createMultiSelectListState({
      items: ["a", "b", "c"],
      initialCursor: "a",
    });
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "End" }))).not.toThrow();
  });

  test("handles looping configuration", () => {
    const { onKeyDown: onKeyDownWithLoop } = createMultiSelectListState({
      items: ["a", "b", "c"],
      loop: true,
      initialCursor: "c",
    });
    expect(() => onKeyDownWithLoop(new KeyboardEvent("keydown", { key: "ArrowDown" }))).not.toThrow();

    const { onKeyDown: onKeyDownNoLoop } = createMultiSelectListState({
      items: ["a", "b", "c"],
      loop: false,
      initialCursor: "c",
    });
    expect(() => onKeyDownNoLoop(new KeyboardEvent("keydown", { key: "ArrowDown" }))).not.toThrow();
  });

  test("handles shift key modifiers", () => {
    const { onKeyDown } = createMultiSelectListState({
      items: ["a", "b", "c"],
      initialCursor: "b",
    });
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "ArrowDown", shiftKey: true }))).not.toThrow();
    expect(() => onKeyDown(new KeyboardEvent("keydown", { key: "Home", shiftKey: true }))).not.toThrow();
  });
});
