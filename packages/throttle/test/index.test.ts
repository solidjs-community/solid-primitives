import { createEffect, createRoot } from "solid-js";
import createThrottle from "../src/index";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("createThrottle", () => {
  test("setup and trigger throttle", async () => {
    let val = 0;
    const [trigger] = createThrottle(current => (val = current), 150);
    expect(val).toBe(0);
    trigger(5);
    await sleep(300);
    expect(val).toBe(5);
  });
  test("trigger multiple throttles", async () => {
    let val = 0;
    const [trigger] = createThrottle(current => (val = current), 150);
    expect(val).toBe(0);
    trigger(5);
    trigger(1);
    await sleep(300);
    expect(val).toBe(5);
  });
  test("test clearing throttle", async () => {
    let val = 0;
    const [trigger, clear] = createThrottle(current => (val = current), 150);
    expect(val).toBe(0);
    trigger(5);
    clear();
    await sleep(300);
    expect(val).toBe(0);
  });
  test("", async () => {
    let val = 0;

    createRoot(stop => {
      createEffect(() => {
        val = 1;
        const [trigger] = createThrottle(v => (val = v), 150);
        trigger(5);
      });

      setTimeout(stop, 200);
    });

    expect(val).toBe(1);
    await sleep(300);
    expect(val).toBe(5);

    val = 0;

    createRoot(stop => {
      createEffect(() => {
        val = 1;
        const [trigger] = createThrottle(v => (val = v), 150);
        trigger(5);
      });

      setTimeout(stop, 10);
    });

    expect(val).toBe(1);
    await sleep(300);
    expect(val).toBe(1);
  });
});
