import { createRoot, createSignal, onCleanup } from "solid-js";
import { describe, test, expect } from "vitest";
import { until, changed, promiseTimeout, raceTimeout } from "../src";

describe("promiseTimeout", () => {
  test("resolves after timeout", async () => {
    let time = Date.now();
    await promiseTimeout(100);
    expect(Date.now() - time).toBeGreaterThan(50);
  });

  test("rejects after timeout", async () => {
    let time = Date.now();
    try {
      await promiseTimeout(100, true, "rejection reason");
    } catch (e) {
      expect(e).toBe("rejection reason");
    }
    expect(Date.now() - time).toBeGreaterThan(50);
  });
});

describe("raceTimeout", () => {
  test("resolves after timeout", async () => {
    let time = Date.now();
    await raceTimeout([new Promise(() => {}), promiseTimeout(200)], 100);
    expect(Date.now() - time).toBeGreaterThan(50);
    expect(Date.now() - time).toBeLessThan(150);
  }, 100);

  test("resolves before timeout", async () => {
    let time = Date.now();
    const res = await raceTimeout(
      [
        new Promise(() => {}),
        (async () => {
          await promiseTimeout(100);
          return "result";
        })()
      ],
      200
    );
    expect(res).toBe("result");
    expect(Date.now() - time).toBeGreaterThan(50);
    expect(Date.now() - time).toBeLessThan(150);
  }, 100);

  test("rejects after timeout", async () => {
    let time = Date.now();
    try {
      await raceTimeout(
        [new Promise(() => {}), promiseTimeout(200)],
        100,
        true,
        new Error("raceTimeout rejection reason")
      );
    } catch (e) {
      expect((e as Error).message).toBe("raceTimeout rejection reason");
    }
    expect(Date.now() - time).toBeGreaterThan(50);
    expect(Date.now() - time).toBeLessThan(150);
  }, 100);
});

describe("until", () => {
  test("return values", () => {
    const returned = until(() => true);
    expect(returned).toBeInstanceOf(Promise);
    expect(returned.dispose).toBeTypeOf("function");
  });

  test("awaits reactive condition", () =>
    createRoot(dispose => {
      const [state, setState] = createSignal(false);

      until(state).then(res => {
        expect(res).toBe(true);
        dispose();
      });

      setTimeout(() => {
        setState(true);
      }, 0);
    }));

  test("computation stops when root disposes", () =>
    createRoot(dispose => {
      const [state, setState] = createSignal(false);
      let captured: any;
      let threw = false;

      until(state)
        .then(res => (captured = res))
        .catch(() => (threw = true));

      dispose();
      setState(true);

      setTimeout(() => {
        expect(captured).toBe(undefined);
        expect(threw).toBe(true);
      }, 0);
    }));

  test(".dispose() will stop computation", () => {
    const [state, setState] = createSignal(false);
    let captured: any;
    let threw = false;

    const res = until(state);
    res.then(res => (captured = res)).catch(() => (threw = true));

    res.dispose();

    setTimeout(() => {
      setState(true);

      setTimeout(() => {
        expect(captured).toBe(undefined);
        expect(threw).toBe(true);
      }, 0);
    }, 0);
  });

  describe("changed", () => {
    test("resolves after changes", () =>
      createRoot(dispose => {
        const [count, setCount] = createSignal(0);
        let captured: any;
        until(changed(count, 2)).then(v => (captured = v));

        setCount(1);
        setTimeout(() => {
          expect(captured).toBe(undefined);

          setCount(1);
          setTimeout(() => {
            expect(captured).toBe(undefined);

            setCount(2);
            setTimeout(() => {
              expect(captured).toBe(true);
              dispose();
            }, 0);
          }, 0);
        }, 0);
      }));
  });

  describe("raceTimeout", () => {
    test("computation get's disposed when timeout", async () => {
      let disposed = false;
      await raceTimeout(
        until(() => {
          onCleanup(() => (disposed = true));
        }),
        100
      );
      expect(disposed).toBe(true);
    });
  });
});
