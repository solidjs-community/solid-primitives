import { describe, test, expect } from "vitest";
import { batch, createRoot, createSignal } from "solid-js";
import { createUndoHistory } from "../src";

describe("createUndoHistory", () => {
  test("single source", () =>
    createRoot(dispose => {
      const [a, setA] = createSignal(0);

      const history = createUndoHistory(() => {
        const v = a();
        return () => setA(v);
      });

      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);

      setA(1);

      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);

      history.undo();

      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(true);
      expect(a()).toBe(0);

      history.redo();

      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);
      expect(a()).toBe(1);

      setA(2);

      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);

      history.undo();

      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(true);
      expect(a()).toBe(1);

      history.undo();

      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(true);
      expect(a()).toBe(0);

      setA(3);

      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);

      history.undo();

      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(true);
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

      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);

      setA(1);

      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);

      dispose();
    });
  });

  test("combined single source", () => {
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

      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);

      setA(1);

      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);

      setB(1);

      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);

      history.undo();

      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(true);
      expect(a()).toBe(1);
      expect(b()).toBe(0);

      history.undo();

      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(true);
      expect(a()).toBe(0);
      expect(b()).toBe(0);

      dispose();
    });
  });

  test("multiple sources", () => {
    createRoot(dispose => {
      const [a, setA] = createSignal(0),
        [b, setB] = createSignal(0);

      let aCount = 0,
        bCount = 0;

      const history = createUndoHistory([
        () => {
          const v = a();
          return () => {
            aCount++;
            setA(v);
          };
        },
        () => {
          const v = b();
          return () => {
            bCount++;
            setB(v);
          };
        },
      ]);

      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);
      expect(aCount).toBe(0);
      expect(bCount).toBe(0);

      setA(1);

      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);
      expect(aCount).toBe(0);
      expect(bCount).toBe(0);

      setB(1);

      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);
      expect(aCount).toBe(0);
      expect(bCount).toBe(0);

      history.undo();

      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(true);
      expect(aCount).toBe(0);
      expect(bCount).toBe(1);
      expect(a()).toBe(1);
      expect(b()).toBe(0);

      history.undo();

      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(true);
      expect(aCount).toBe(1);
      expect(bCount).toBe(1);
      expect(a()).toBe(0);
      expect(b()).toBe(0);

      history.redo();

      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(true);
      expect(aCount).toBe(2);
      expect(bCount).toBe(1);
      expect(a()).toBe(1);
      expect(b()).toBe(0);

      batch(() => {
        setA(2);
        setB(2);
      });

      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);
      expect(aCount).toBe(2);
      expect(bCount).toBe(1);

      history.undo();

      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(true);
      expect(aCount).toBe(3);
      expect(bCount).toBe(2);
      expect(a()).toBe(1);
      expect(b()).toBe(0);

      history.undo();

      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(true);
      expect(aCount).toBe(4);
      expect(bCount).toBe(2);
      expect(a()).toBe(0);
      expect(b()).toBe(0);

      dispose();
    });
  });

  test("pausing tracking", () => {
    createRoot(dispose => {
      const [count, setCount] = createSignal(0);
      const [track, setTrack] = createSignal(true);

      const history = createUndoHistory(() => {
        if (track()) {
          const v = count();
          return () => setCount(v);
        }
      });

      setCount(1);
      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);

      setTrack(false); // disable tracking
      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);

      setCount(2); // will NOT create a point in history
      setCount(3); // will NOT create a point in history
      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);

      setTrack(true); // enable tracking, and create a point in history for the last change
      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);

      history.undo(); // will set count to 1
      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(true);
      expect(count()).toBe(1);

      history.undo(); // will set count to 0
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(true);
      expect(count()).toBe(0);

      history.redo(); // will set count to 1
      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(true);
      expect(count()).toBe(1);

      history.redo(); // will set count to 3
      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);
      expect(count()).toBe(3);

      dispose();
    });
  });
});
