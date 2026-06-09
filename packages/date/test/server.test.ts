import { describe, expect, it } from "vitest";
import { createRoot } from "solid-js";
import {
  createDate,
  createDateNow,
  createTimeAgo,
  createTimeDifference,
  createCountdown,
  MINUTE,
} from "../src/index.js";

describe("SSR", () => {
  it("createDateNow returns a stable date on server", () => {
    const [now, update] = createDateNow();
    const initial = now().getTime();
    update(); // should be a no-op on server
    expect(now().getTime()).toBe(initial);
  });

  it("createDate works on server", () => {
    const ts = Date.now() - 5 * MINUTE;
    const [date] = createDate(ts);
    expect(date()).toBeInstanceOf(Date);
    expect(date().getTime()).toBe(ts);
  });

  it("createTimeDifference works on server", () => {
    createRoot(dispose => {
      const past = Date.now() - 3 * MINUTE;
      const [diff] = createTimeDifference(past, Date.now());
      expect(Math.abs(diff())).toBeGreaterThan(0);
      dispose();
    });
  });

  it("createTimeAgo works on server", () => {
    createRoot(dispose => {
      const past = Date.now() - 3 * MINUTE;
      const [ago] = createTimeAgo(past);
      expect(typeof ago()).toBe("string");
      expect(ago().length).toBeGreaterThan(0);
      dispose();
    });
  });

  it("createCountdown works on server", () => {
    createRoot(dispose => {
      const future = Date.now() + 65 * 1000;
      const countdown = createCountdown(Date.now(), future);
      expect(typeof countdown.minutes).toBe("number");
      dispose();
    });
  });
});
