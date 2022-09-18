import { batch, createRoot, createSignal } from "solid-js";
import { describe, test, expect } from "vitest";
import { createTimer } from "../src";

const sleep = (delay: number) => new Promise<void>(resolve => setTimeout(resolve, delay));

describe("createTimes", () => {
  test("createTimer calls and disposes when expected with number", async () => {
    let timeoutCount = 0;
    let intervalCount = 0;

    await createRoot(async dispose => {
      createTimer(() => timeoutCount++, 100, setTimeout);
      createTimer(() => intervalCount++, 100, setInterval);
      await sleep(50);
      dispose();
    });
    await sleep(100);
    expect(timeoutCount).toBe(0);
    expect(intervalCount).toBe(0);

    await createRoot(async dispose => {
      createTimer(() => timeoutCount++, 100, setTimeout);
      createTimer(() => intervalCount++, 100, setInterval);
      await sleep(50); // 0.5, account for drift
      expect(timeoutCount).toBe(0);
      expect(intervalCount).toBe(0);
      await sleep(100); // 1.5
      expect(timeoutCount).toBe(1);
      expect(intervalCount).toBe(1);
      await sleep(100); // 2.5
      expect(timeoutCount).toBe(1);
      expect(intervalCount).toBe(2);
      dispose();
    });
    await sleep(100); // 3.5
    expect(timeoutCount).toBe(1);
    expect(intervalCount).toBe(2);
  });

  test("createInterval calls when expected with accessor", async () => {
    let timeoutCount = 0;
    let intervalCount = 0;

    await createRoot(async dispose => {
      const [paused, setPaused] = createSignal(false);
      const [delay, setDelay] = createSignal(50);
      createTimer(
        () => timeoutCount++,
        () => !paused() && delay(),
        setTimeout
      );
      createTimer(
        () => intervalCount++,
        () => !paused() && delay(),
        setInterval
      );
      setPaused(true);
      await sleep(300);
      setPaused(false);
      expect(timeoutCount).toBe(0);
      expect(intervalCount).toBe(0);
      setPaused(true);
      await sleep(100);
      batch(() => {
        setPaused(false);
        setDelay(100);
      });
      await sleep(10);
      expect(timeoutCount).toBe(0);
      expect(intervalCount).toBe(0);
      await sleep(160);
      expect(timeoutCount).toBe(1);
      expect(intervalCount).toBe(1);
      dispose();
    });

    timeoutCount = 0;
    intervalCount = 0;

    await createRoot(async dispose => {
      const [delay, setDelay] = createSignal(100);
      createTimer(() => timeoutCount++, delay, setTimeout);
      createTimer(() => intervalCount++, delay, setInterval);
      await sleep(50); // 0.5, account for drift
      expect(timeoutCount).toBe(0);
      expect(intervalCount).toBe(0);
      await sleep(100); // 1.5
      expect(timeoutCount).toBe(1);
      expect(intervalCount).toBe(1);
      await sleep(60); // 2.1
      expect(timeoutCount).toBe(1);
      expect(intervalCount).toBe(2);
      setDelay(200);
      await sleep(100); // 3
      expect(timeoutCount).toBe(1);
      expect(intervalCount).toBe(2);
      await sleep(80); // 3.2
      expect(timeoutCount).toBe(1);
      expect(intervalCount).toBe(3);
      await sleep(200); // 4.2
      expect(timeoutCount).toBe(1);
      expect(intervalCount).toBe(4);
      dispose();
    });

    await sleep(200); // 5.2
    expect(timeoutCount).toBe(1);
    expect(intervalCount).toBe(4);
  });
});
