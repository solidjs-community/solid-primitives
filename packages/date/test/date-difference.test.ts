import { describe, it, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import {
  createTimeAgo,
  RelativeFormatMessages,
  DAY,
  HOUR,
  MINUTE,
  MONTH,
  WEEK,
  YEAR
} from "../src";

describe("createTimeAgo", () => {
  it("formats timeago correctly", () => {
    createRoot(dispose => {
      const [date, setDate] = createSignal<number>(Date.now());
      const [timeago] = createTimeAgo(date, {
        interval: 0
      });

      expect(timeago()).toBe("just now");

      setDate(p => p - 3 * MINUTE);
      expect(timeago()).toBe("3 minutes ago");

      setDate(p => p - 2 * HOUR);
      expect(timeago()).toBe("2 hours ago");

      setDate(p => p + 2 * WEEK);
      expect(timeago()).toBe("in 2 weeks");

      setDate(p => p + 2 * MONTH);
      expect(timeago()).toBe("in 2 months");

      setDate(p => p - YEAR - 2 * MONTH);
      expect(timeago()).toBe("last year");

      setDate(p => p - YEAR);
      expect(timeago()).toBe("2 years ago");

      dispose();
    });
  });

  it("custom relative formatter", () => {
    createRoot(dispose => {
      const [date, setDate] = createSignal<number>(Date.now());

      let captured_target;
      let captured_now;
      let captured_diff;
      const [timeago, { target, now }] = createTimeAgo(date, {
        interval: 0,
        relativeFormatter: (now, target, diff) => {
          captured_target = target;
          captured_now = now;
          captured_diff = diff;
          return "relative";
        }
      });

      expect(timeago(), "'now' should still be 'just now'").toBe("just now");

      setDate(p => p - 3 * MINUTE);
      expect(timeago(), "custom formatter was correctly applied").toBe("relative");

      expect(target(), "captured target should match the returned one").toBe(captured_target);
      expect(now(), "captured now should match the returned one").toBe(captured_now);
      expect(
        captured_diff,
        "captured diff should be the same as calculated from now() and target()"
      ).toBe(target().getTime() - now().getTime());

      dispose();
    });
  });

  it("custom absolute formatter", () => {
    createRoot(dispose => {
      const [date, setDate] = createSignal<number>(Date.now());

      let capturedDate;
      const [timeago, { target }] = createTimeAgo(date, {
        interval: 0,
        max: HOUR,
        dateFormatter: date => {
          capturedDate = date;
          return "absolute";
        }
      });

      expect(timeago()).toBe("just now");

      setDate(p => p - 3 * MINUTE);
      expect(timeago()).toBe("3 minutes ago");

      setDate(p => p - 2 * HOUR);
      expect(timeago(), "absolute formatter should be appled").toBe("absolute");
      expect(capturedDate, "captured date should math the target()").toBe(target());

      dispose();
    });
  });

  it("custom messages", () => {
    createRoot(dispose => {
      const [date, setDate] = createSignal<number>(Date.now());

      const messages: Partial<RelativeFormatMessages> = {
        justNow: "NOW",
        future: n => `in the next ${n}`,
        day: (n, past) => `${n} DAY${n > 1 ? "S" : ""}`,
        week: (n, past) => (n === 1 ? "week" : `${n} weeks`)
      };

      const [timeago] = createTimeAgo(date, {
        interval: 0,
        messages
      });

      expect(timeago()).toBe("NOW");

      setDate(p => p - 3 * MINUTE);
      expect(timeago()).toBe("3 minutes ago");

      setDate(p => p - 2 * DAY);
      expect(timeago()).toBe("2 DAYS ago");

      setDate(p => p + 1 * WEEK + 2 * DAY);
      expect(timeago()).toBe("in the next week");

      setDate(p => p + 1 * WEEK);
      expect(timeago()).toBe("in the next 2 weeks");

      setDate(p => p + 2 * MONTH);
      expect(timeago()).toBe("in the next 2 months");

      setDate(p => p - YEAR - 2 * MONTH);
      expect(timeago()).toBe("last year");

      setDate(p => p - YEAR);
      expect(timeago()).toBe("2 years ago");

      dispose();
    });
  });
});
