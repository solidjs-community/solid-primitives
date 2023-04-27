import { describe, test, expect } from "vitest";
import { createRootPool } from "../src";
import {
  createRoot,
  getOwner,
  createContext,
  useContext,
  onCleanup,
  Accessor,
  createEffect,
  createComputed,
  createSignal,
  runWithOwner,
} from "solid-js";

const sleep = (ms: number = 0) => new Promise(resolve => setTimeout(resolve, ms));

describe("createRootPool", () => {
  test("creates individual roots", () => {
    createRoot(dispose => {
      const ownerList: unknown[] = [];

      const pool = createRootPool(() => {
        ownerList.push(getOwner());
      });

      pool();
      pool();

      expect(ownerList[0]).not.toBe(ownerList[1]);
      expect(ownerList[0]).not.toBe(getOwner());
      expect(ownerList[0]).not.toBe(null);
      expect(ownerList).toHaveLength(2);

      dispose();
    });
  });

  test("roots are created under the owner of the pool", () => {
    const Ctx = createContext("fallback");

    const root = createRoot(dispose => {
      let pool!: ReturnType<typeof createRootPool>;

      Ctx.Provider({
        value: "root",
        get children() {
          pool = createRootPool(() => {
            const ctx = useContext(Ctx);
            expect(ctx).toBe("root");
          });
          return "";
        },
      });

      return { dispose, pool };
    });

    createRoot(dispose => {
      root.pool(null);
      dispose();
      root.dispose();
    });
  });

  test("roots are disposed with the pool", async () => {
    await createRoot(async dispose => {
      let cleanup = false;

      const pool = createRootPool(() => {
        onCleanup(() => (cleanup = true));
      });

      await createRoot(async d => {
        pool();

        expect(cleanup).toBe(false);

        d();
        await sleep();

        expect(cleanup).toBe(false);

        dispose();

        expect(cleanup).toBe(true);
      });
    });
  });

  test("pool limit can be set to 0", async () => {
    await createRoot(async dispose => {
      let cleanup = false;

      const pool = createRootPool(
        () => {
          onCleanup(() => (cleanup = true));
        },
        { limit: 0 },
      );

      await createRoot(async d => {
        pool();

        expect(cleanup).toBe(false);

        d();
        await sleep();

        expect(cleanup).toBe(true);

        dispose();
      });
    });
  });

  test("roots are reused and arguments updated", () => {
    createRoot(dispose => {
      const capturedArgs: any[] = [];
      const cleanups: any[] = [];
      let roots = 0;

      const pool = createRootPool((n: Accessor<number>) => {
        roots++;
        createComputed(() => {
          capturedArgs.push(n());
        });
        onCleanup(() => {
          cleanups.push(n());
        });
      });

      createRoot(d => {
        pool(0);
        pool(1);
        pool(2);
        d();
      });

      expect(capturedArgs).toEqual([0, 1, 2]);
      expect(roots).toBe(3);
      expect(cleanups).toEqual([]);

      pool(3);
      pool(4);
      pool(5);

      expect(capturedArgs).toEqual([0, 1, 2, 3, 4, 5]);
      expect(roots).toBe(3);
      expect(cleanups).toEqual([]);

      dispose();

      expect(capturedArgs).toEqual([0, 1, 2, 3, 4, 5]);
      expect(roots).toBe(3);
      expect(cleanups).toEqual([5, 4, 3]);
    });
  });

  test("roots are returning values every time", () => {
    createRoot(dispose => {
      let i = 0;
      const pool = createRootPool(() => i++);

      createRoot(d => {
        expect(pool()).toBe(0);
        expect(pool()).toBe(1);
        expect(pool()).toBe(2);

        d();
      });

      expect(pool()).toBe(0);
      expect(pool()).toBe(1);
      expect(pool()).toBe(2);

      dispose();
    });
  });

  test("roots are not suspended by default if in pool", async () => {
    await createRoot(async dispose => {
      const [count, setCount] = createSignal(1);
      let i = 0;
      const captured = [0, 0];
      const owner = getOwner();

      const pool = createRootPool(() => {
        const index = i++;
        createEffect(() => {
          captured[index] = count();
        });
      });

      await sleep();

      expect(captured).toEqual([0, 0]);

      let disposeRoot!: VoidFunction;
      runWithOwner(owner, () => {
        pool();
        disposeRoot = createRoot(dispose => {
          pool();
          return dispose;
        });
      });

      await sleep();
      expect(captured).toEqual([1, 1]);
      setCount(2);

      await sleep();
      expect(captured).toEqual([2, 2]);
      disposeRoot();

      setCount(3);

      await sleep();
      expect(captured).toEqual([3, 3]);

      setCount(4);
      await sleep();
      expect(captured).toEqual([4, 4]);

      runWithOwner(owner, pool);
      await sleep();
      expect(captured).toEqual([4, 4]);

      setCount(5);
      await sleep();
      expect(captured).toEqual([5, 5]);

      dispose();
      await sleep();
      expect(captured).toEqual([5, 5]);

      setCount(6);
      await sleep();
      expect(captured).toEqual([5, 5]);
    });
  });

  test("pooled state is a signal", async () => {
    await createRoot(async dispose => {
      const [count, setCount] = createSignal(1);
      let i = 0;
      const captured = [0, 0];
      const owner = getOwner();

      const pool = createRootPool((arg, active) => {
        const index = i++;
        createEffect(() => {
          if (active()) captured[index] = count();
        });
      });

      await sleep();

      expect(captured).toEqual([0, 0]);

      let disposeRoot!: VoidFunction;
      runWithOwner(owner, () => {
        pool();
        disposeRoot = createRoot(dispose => {
          pool();
          return dispose;
        });
      });

      await sleep();
      expect(captured).toEqual([1, 1]);
      setCount(2);

      await sleep();
      expect(captured).toEqual([2, 2]);
      disposeRoot();

      setCount(3);

      await sleep();
      expect(captured).toEqual([3, 2]);

      setCount(4);
      await sleep();
      expect(captured).toEqual([4, 2]);

      runWithOwner(owner, pool);
      await sleep();
      expect(captured).toEqual([4, 4]);

      setCount(5);
      await sleep();
      expect(captured).toEqual([5, 5]);

      dispose();
      await sleep();
      expect(captured).toEqual([5, 5]);

      setCount(6);
      await sleep();
      expect(captured).toEqual([5, 5]);
    });
  });
});
