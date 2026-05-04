import { describe, it, expect } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import {
  createTimeAgo,
  RelativeFormatMessages,
  DAY,
  HOUR,
  MINUTE,
  MONTH,
  WEEK,
  YEAR,
} from "../src/index.js";

describe("createTimeAgo", () => {
  it("formats timeago correctly", () => {
    const [date, setDate] = createSignal<number>(Date.now());

    const { timeago, dispose } = createRoot(dispose => {
      const [timeago] = createTimeAgo(date, { interval: 0 });
      return { timeago, dispose };
    });

    expect(timeago()).toBe("just now");

    setDate(p => p - 3 * MINUTE);
    flush();
    expect(timeago()).toBe("3 minutes ago");

    setDate(p => p - 2 * HOUR);
    flush();
    expect(timeago()).toBe("2 hours ago");

    setDate(p => p + 2 * WEEK);
    flush();
    expect(timeago()).toBe("in 2 weeks");

    setDate(p => p + 2 * MONTH);
    flush();
    expect(timeago()).toBe("in 2 months");

    setDate(p => p - YEAR - 2 * MONTH);
    flush();
    expect(timeago()).toBe("last year");

    setDate(p => p - YEAR);
    flush();
    expect(timeago()).toBe("2 years ago");

    dispose();
  });

  it("custom relative formatter", () => {
    const [date, setDate] = createSignal<number>(Date.now());

    let captured_target: Date | undefined;
    let captured_now: Date | undefined;
    let captured_diff: number | undefined;

    const { timeago, target, now, dispose } = createRoot(dispose => {
      const [timeago, { target, now }] = createTimeAgo(date, {
        interval: 0,
        relativeFormatter: (now, target, diff) => {
          captured_target = target;
          captured_now = now;
          captured_diff = diff;
          return "relative";
        },
      });
      return { timeago, target, now, dispose };
    });

    expect(timeago(), "'now' should still be 'just now'").toBe("just now");

    setDate(p => p - 3 * MINUTE);
    flush();
    expect(timeago(), "custom formatter was correctly applied").toBe("relative");

    expect(target(), "captured target should match the returned one").toBe(captured_target);
    expect(now(), "captured now should match the returned one").toBe(captured_now);
    expect(
      captured_diff,
      "captured diff should be the same as calculated from now() and target()",
    ).toBe(target().getTime() - now().getTime());

    dispose();
  });

  it("custom absolute formatter", () => {
    const [date, setDate] = createSignal<number>(Date.now());

    let capturedDate: Date | undefined;
    const { timeago, target, dispose } = createRoot(dispose => {
      const [timeago, { target }] = createTimeAgo(date, {
        interval: 0,
        max: HOUR,
        dateFormatter: date => {
          capturedDate = date;
          return "absolute";
        },
      });
      return { timeago, target, dispose };
    });

    expect(timeago()).toBe("just now");

    setDate(p => p - 3 * MINUTE);
    flush();
    expect(timeago()).toBe("3 minutes ago");

    setDate(p => p - 2 * HOUR);
    flush();
    expect(timeago(), "absolute formatter should be applied").toBe("absolute");
    expect(capturedDate, "captured date should match the target()").toBe(target());

    dispose();
  });

  it("custom messages", () => {
    const [date, setDate] = createSignal<number>(Date.now());

    const messages: Partial<RelativeFormatMessages> = {
      justNow: "NOW",
      future: n => `in the next ${n}`,
      day: (n, _past) => `${n} DAY${n > 1 ? "S" : ""}`,
      week: (n, _past) => (n === 1 ? "week" : `${n} weeks`),
    };

    const { timeago, dispose } = createRoot(dispose => {
      const [timeago] = createTimeAgo(date, { interval: 0, messages });
      return { timeago, dispose };
    });

    expect(timeago()).toBe("NOW");

    setDate(p => p - 3 * MINUTE);
    flush();
    expect(timeago()).toBe("3 minutes ago");

    setDate(p => p - 2 * DAY);
    flush();
    expect(timeago()).toBe("2 DAYS ago");

    setDate(p => p + 1 * WEEK + 2 * DAY);
    flush();
    expect(timeago()).toBe("in the next week");

    setDate(p => p + 1 * WEEK);
    flush();
    expect(timeago()).toBe("in the next 2 weeks");

    setDate(p => p + 2 * MONTH);
    flush();
    expect(timeago()).toBe("in the next 2 months");

    setDate(p => p - YEAR - 2 * MONTH);
    flush();
    expect(timeago()).toBe("last year");

    setDate(p => p - YEAR);
    flush();
    expect(timeago()).toBe("2 years ago");

    dispose();
  });
});
