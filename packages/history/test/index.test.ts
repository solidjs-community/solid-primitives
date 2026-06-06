import { describe, test, expect } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { createUndoHistory } from "../src/index.js";

describe("createUndoHistory", () => {
  test("single source", () => {
    const [a, setA] = createSignal(0);

    const { history, dispose } = createRoot(dispose => ({
      history: createUndoHistory(() => {
        const v = a();
        return () => setA(v);
      }),
      dispose,
    }));

    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);

    setA(1);
    flush();

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);

    history.undo();
    flush();

    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);
    expect(a()).toBe(0);

    history.redo();
    flush();

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);
    expect(a()).toBe(1);

    setA(2);
    flush();

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);

    history.undo();
    flush();

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(true);
    expect(a()).toBe(1);

    history.undo();
    flush();

    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);
    expect(a()).toBe(0);

    setA(3);
    flush();

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);

    history.undo();
    flush();

    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);
    expect(a()).toBe(0);

    dispose();
  });

  test("going over limit", () => {
    const [a, setA] = createSignal(0);

    const { history, dispose } = createRoot(dispose => ({
      history: createUndoHistory(
        () => {
          const v = a();
          return () => setA(v);
        },
        { limit: 0 },
      ),
      dispose,
    }));

    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);

    setA(1);
    flush();

    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);

    dispose();
  });

  test("combined single source", () => {
    const [a, setA] = createSignal(0),
      [b, setB] = createSignal(0);

    const { history, dispose } = createRoot(dispose => ({
      history: createUndoHistory(() => {
        const aValue = a();
        const bValue = b();
        return () => {
          setA(aValue);
          setB(bValue);
        };
      }),
      dispose,
    }));

    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);

    setA(1);
    flush();

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);

    setB(1);
    flush();

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);

    history.undo();
    flush();

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(true);
    expect(a()).toBe(1);
    expect(b()).toBe(0);

    history.undo();
    flush();

    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);
    expect(a()).toBe(0);
    expect(b()).toBe(0);

    dispose();
  });

  test("multiple sources", () => {
    const [a, setA] = createSignal(0),
      [b, setB] = createSignal(0);

    let aCount = 0,
      bCount = 0;

    const { history, dispose } = createRoot(dispose => ({
      history: createUndoHistory([
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
      ]),
      dispose,
    }));

    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
    expect(aCount).toBe(0);
    expect(bCount).toBe(0);

    setA(1);
    flush();

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);
    expect(aCount).toBe(0);
    expect(bCount).toBe(0);

    setB(1);
    flush();

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);
    expect(aCount).toBe(0);
    expect(bCount).toBe(0);

    history.undo();
    flush();

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(true);
    expect(aCount).toBe(0);
    expect(bCount).toBe(1);
    expect(a()).toBe(1);
    expect(b()).toBe(0);

    history.undo();
    flush();

    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);
    expect(aCount).toBe(1);
    expect(bCount).toBe(1);
    expect(a()).toBe(0);
    expect(b()).toBe(0);

    history.redo();
    flush();

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(true);
    expect(aCount).toBe(2);
    expect(bCount).toBe(1);
    expect(a()).toBe(1);
    expect(b()).toBe(0);

    // updates are batched by default — both changes create a single history entry
    setA(2);
    setB(2);
    flush();

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);
    expect(aCount).toBe(2);
    expect(bCount).toBe(1);

    history.undo();
    flush();

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(true);
    expect(aCount).toBe(3);
    expect(bCount).toBe(2);
    expect(a()).toBe(1);
    expect(b()).toBe(0);

    history.undo();
    flush();

    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);
    expect(aCount).toBe(4);
    expect(bCount).toBe(2);
    expect(a()).toBe(0);
    expect(b()).toBe(0);

    dispose();
  });

  test("pausing tracking", () => {
    const [count, setCount] = createSignal(0);
    const [track, setTrack] = createSignal(true);

    const { history, dispose } = createRoot(dispose => ({
      history: createUndoHistory(() => {
        if (track()) {
          const v = count();
          return () => setCount(v);
        }
      }),
      dispose,
    }));

    setCount(1);
    flush();
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);

    setTrack(false); // disable tracking
    flush();
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);

    setCount(2); // will NOT create a point in history
    setCount(3); // will NOT create a point in history
    flush();
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);

    setTrack(true); // enable tracking, and create a point in history for the last change
    flush();
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);

    history.undo(); // will set count to 1
    flush();
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(true);
    expect(count()).toBe(1);

    history.undo(); // will set count to 0
    flush();
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);
    expect(count()).toBe(0);

    history.redo(); // will set count to 1
    flush();
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(true);
    expect(count()).toBe(1);

    history.redo(); // will set count to 3
    flush();
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);
    expect(count()).toBe(3);

    dispose();
  });
});
