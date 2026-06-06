import { describe, expect, test } from "vitest";
import { createUndoHistory } from "../src/index.js";

describe("createUndoHistory - SSR", () => {
  test("returns no-op stubs on server", () => {
    const history = createUndoHistory(() => () => {});
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
    history.undo();
    history.redo();
  });
});
