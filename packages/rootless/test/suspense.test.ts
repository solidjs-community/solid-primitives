import { describe, test, expect } from "vitest";
import { createSuspense } from "../src";
import { createRoot, createEffect, createSignal } from "solid-js";

const sleep = (ms: number = 0) => new Promise(resolve => setTimeout(resolve, ms));

describe("createSuspense", () => {
  test("effects get suspended", async () => {
    await createRoot(async dispose => {
      const [count, setCount] = createSignal(1);
      const [isSuspended, setSuspended] = createSignal(false);
      const captured = {
        suspended: 0,
        normal: 0,
      };

      createEffect(() => {
        captured.normal = count();
      });

      createSuspense(isSuspended, () => {
        createEffect(() => {
          captured.suspended = count();
        });
      });

      await sleep();

      expect(captured).toEqual({
        suspended: 1,
        normal: 1,
      });

      await sleep();
      expect(captured).toEqual({
        suspended: 1,
        normal: 1,
      });
      setCount(2);

      await sleep();
      expect(captured).toEqual({
        suspended: 2,
        normal: 2,
      });

      setSuspended(true);

      setCount(3);

      await sleep();
      expect(captured).toEqual({
        suspended: 2,
        normal: 3,
      });

      setCount(4);
      await sleep();
      expect(captured).toEqual({
        suspended: 2,
        normal: 4,
      });

      setSuspended(false);

      await sleep();
      expect(captured).toEqual({
        suspended: 4,
        normal: 4,
      });

      setCount(5);
      await sleep();
      expect(captured).toEqual({
        suspended: 5,
        normal: 5,
      });

      dispose();
      await sleep();
      expect(captured).toEqual({
        suspended: 5,
        normal: 5,
      });

      setCount(6);
      await sleep();
      expect(captured).toEqual({
        suspended: 5,
        normal: 5,
      });
    });
  });
});
