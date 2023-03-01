import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { createDateNow } from "../src";

describe("createDateNow", () => {
  it("returns an signal an update function", () => {
    createRoot(dispose => {
      const test_now = Date.now();
      const [now] = createDateNow(0);

      const time = now().getTime();
      expect(
        time > test_now - 100 && time < test_now + 100,
        "the date should be 'now'",
      ).toBeTruthy();

      dispose();
    });
  });

  it("autoupdates", () => {
    createRoot(dispose => {
      const [now] = createDateNow(1);
      const time1 = now().getTime();

      setTimeout(() => {
        const time2 = now().getTime();
        expect(time2, "the newer timestamp should have bigger value").toBeGreaterThan(time1);
        dispose();
      }, 20);
    });
  });

  it("manual updating", () => {
    createRoot(dispose => {
      const [now, update] = createDateNow(() => false);
      const time1 = now().getTime();

      setTimeout(() => {
        const time2 = now().getTime();
        expect(time1, "the time shouldn't update").toBe(time2);
        update();

        setTimeout(() => {
          const time3 = now().getTime();
          expect(time3, "the timestamp after update() should have bigger value").toBeGreaterThan(
            time2,
          );
          dispose();
        }, 30);
      }, 2);
    });
  });

  it("stop autoupdating onCleanup", () => {
    createRoot(dispose => {
      const [now] = createDateNow(1);
      const time1 = now().getTime();

      dispose();

      setTimeout(() => {
        const time2 = now().getTime();
        expect(time1, "the time shouldn't update").toBe(time2);
      }, 2);
    });
  });
});
