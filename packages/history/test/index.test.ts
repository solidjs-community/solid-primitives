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

  test("multiple sources, one intermittently paused - no spurious/misaligned restores", () => {
    const [a, setA] = createSignal(0);
    const [b, setB] = createSignal(0);
    const [trackB, setTrackB] = createSignal(true);
    let bCalls = 0;

    const { history, dispose } = createRoot(dispose => ({
      history: createUndoHistory([
        () => {
          const v = a();
          return () => setA(v);
        },
        () => {
          if (!trackB()) return undefined;
          const v = b();
          return () => {
            bCalls++;
            setB(v);
          };
        },
      ]),
      dispose,
    }));

    // recorded entries: E0(a0,b0) E1(a1,b0) E2(a1,-b paused-) E3(a2,-b paused-)
    setA(1);
    flush();
    setTrackB(false);
    flush();
    setA(2);
    flush();

    history.undo(); // E3 -> E2
    flush();
    expect(a()).toBe(1);
    expect(bCalls).toBe(0); // b never changed, must not fire

    history.undo(); // E2 -> E1 (crosses the pause boundary)
    flush();
    expect(a()).toBe(1); // a is legitimately unchanged between E1/E2 — not a bug
    expect(bCalls).toBe(0); // must not spuriously re-fire b just because array shapes differ across the boundary

    history.undo(); // E1 -> E0
    flush();
    expect(a()).toBe(0);
    expect(bCalls).toBe(0);
    expect(history.canUndo()).toBe(false);

    history.redo(); // E0 -> E1
    flush();
    history.redo(); // E1 -> E2 (crosses the pause boundary going forward)
    flush();
    expect(bCalls).toBe(0);
    history.redo(); // E2 -> E3
    flush();
    expect(a()).toBe(2);
    expect(bCalls).toBe(0);

    dispose();
  });

  test("undo/redo don't record a bogus entry under natural (non-flushed) microtask timing", async () => {
    // Regression test: the internal "ignore recording during undo/redo" flag
    // must not depend on a separately-scheduled microtask racing against
    // Solid's own auto-batched write flush — a single explicit flush() call
    // right after undo()/redo() can mask that race, so this deliberately
    // awaits real microtask ticks instead.
    const tick = async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    };

    const [a, setA] = createSignal(0);
    const { history, dispose } = createRoot(dispose => ({
      history: createUndoHistory(() => {
        const v = a();
        return () => setA(v);
      }),
      dispose,
    }));

    setA(1);
    await tick();
    setA(2);
    await tick();

    history.undo();
    await tick();
    expect(a()).toBe(1);
    expect(history.canRedo()).toBe(true); // must not have recorded the undo's own restore as a new entry

    history.undo();
    await tick();
    expect(a()).toBe(0);
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);

    history.redo();
    await tick();
    history.redo();
    await tick();
    expect(a()).toBe(2);
    expect(history.canRedo()).toBe(false);

    dispose();
  });

  test("default limit is bounded to 100 undo steps", () => {
    const [a, setA] = createSignal(0);
    const { history, dispose } = createRoot(dispose => ({
      history: createUndoHistory(() => {
        const v = a();
        return () => setA(v);
      }),
      dispose,
    }));

    for (let i = 1; i <= 500; i++) {
      setA(i);
      flush();
    }

    let steps = 0;
    while (history.canUndo() && steps < 1000) {
      history.undo();
      flush();
      steps++;
    }
    expect(steps).toBe(100);

    dispose();
  });

  test("limit: 0 means zero retention", () => {
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

    setA(1);
    flush();
    expect(history.canUndo()).toBe(false);

    dispose();
  });
});
