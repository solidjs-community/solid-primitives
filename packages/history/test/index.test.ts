import { describe, test, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createUndoHistory } from "../src";

describe("createUndoHistory", () => {
  test("timetravel", () =>
    createRoot(dispose => {
      const [a, setA] = createSignal(0);

      const history = createUndoHistory(() => {
        const v = a();
        return () => setA(v);
      });

      expect(history.getCanUndo()).toBe(false);
      expect(history.getCanRedo()).toBe(false);

      setA(1);

      expect(history.getCanUndo()).toBe(true);
      expect(history.getCanRedo()).toBe(false);

      history.undo();

      expect(history.getCanUndo()).toBe(false);
      expect(history.getCanRedo()).toBe(true);
      expect(a()).toBe(0);

      history.redo();

      expect(history.getCanUndo()).toBe(true);
      expect(history.getCanRedo()).toBe(false);
      expect(a()).toBe(1);

      setA(2);

      expect(history.getCanUndo()).toBe(true);
      expect(history.getCanRedo()).toBe(false);

      history.undo();

      expect(history.getCanUndo()).toBe(true);
      expect(history.getCanRedo()).toBe(true);
      expect(a()).toBe(1);

      history.undo();

      expect(history.getCanUndo()).toBe(false);
      expect(history.getCanRedo()).toBe(true);
      expect(a()).toBe(0);

      setA(3);

      expect(history.getCanUndo()).toBe(true);
      expect(history.getCanRedo()).toBe(false);

      history.undo();

      expect(history.getCanUndo()).toBe(false);
      expect(history.getCanRedo()).toBe(true);
      expect(a()).toBe(0);

      dispose();
    }));

  test("going over limit", () => {
    createRoot(dispose => {
      const [a, setA] = createSignal(0);

      const history = createUndoHistory(
        () => {
          const v = a();
          return () => setA(v);
        },
        { limit: 0 },
      );

      expect(history.getCanUndo()).toBe(false);
      expect(history.getCanRedo()).toBe(false);

      setA(1);

      expect(history.getCanUndo()).toBe(false);
      expect(history.getCanRedo()).toBe(false);

      dispose();
    });
  });

  test("multiple sources", () => {
    createRoot(dispose => {
      const [a, setA] = createSignal(0),
        [b, setB] = createSignal(0);

      const history = createUndoHistory(() => {
        const aValue = a();
        const bValue = b();
        return () => {
          setA(aValue);
          setB(bValue);
        };
      });

      expect(history.getCanUndo()).toBe(false);
      expect(history.getCanRedo()).toBe(false);

      setA(1);

      expect(history.getCanUndo()).toBe(true);
      expect(history.getCanRedo()).toBe(false);

      setB(1);

      expect(history.getCanUndo()).toBe(true);
      expect(history.getCanRedo()).toBe(false);

      history.undo();

      expect(history.getCanUndo()).toBe(true);
      expect(history.getCanRedo()).toBe(true);
      expect(a()).toBe(1);
      expect(b()).toBe(0);

      history.undo();

      expect(history.getCanUndo()).toBe(false);
      expect(history.getCanRedo()).toBe(true);
      expect(a()).toBe(0);
      expect(b()).toBe(0);

      dispose();
    });
  });
});
