import { createRoot, createSignal } from "solid-js";
import { test } from "uvu";
import * as assert from "uvu/assert";
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

test("returns correct values", () => {
  createRoot(dispose => {
    const date = new Date("2020 1 11");
    const [timeago, { update, target, now }] = createTimeAgo(date);

    assert.type(timeago(), "string", "timeago should return a string");
    assert.instance(now(), Date, "now() should return an instance of Date");
    assert.instance(target(), Date, "target() should return an instance of Date");
    assert.is(target().getTime(), date.getTime(), "target() should math the passed date");
    assert.type(update, "function", "should return an update function");
    dispose();
  });
});

test("formats timeago correctly", () => {
  createRoot(dispose => {
    const [date, setDate] = createSignal<number>(Date.now());
    const [timeago] = createTimeAgo(date, {
      interval: 0
    });

    assert.is(timeago(), "just now");

    setDate(p => p - 3 * MINUTE);
    assert.is(timeago(), "3 minutes ago");

    setDate(p => p - 2 * HOUR);
    assert.is(timeago(), "2 hours ago");

    setDate(p => p + 2 * WEEK);
    assert.is(timeago(), "in 2 weeks");

    setDate(p => p + 2 * MONTH);
    assert.is(timeago(), "in 2 months");

    setDate(p => p - YEAR - 2 * MONTH);
    assert.is(timeago(), "last year");

    setDate(p => p - YEAR);
    assert.is(timeago(), "2 years ago");

    dispose();
  });
});

test("custom relative formatter", () => {
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

    assert.is(timeago(), "just now", "'now' should still be 'just now'");

    setDate(p => p - 3 * MINUTE);
    assert.is(timeago(), "relative", "custom formatter was correctly applied");

    assert.is(target(), captured_target, "captured target should match the returned one");
    assert.is(now(), captured_now, "captured now should match the returned one");
    assert.is(
      captured_diff,
      target().getTime() - now().getTime(),
      "captured diff should be the same as calculated from now() and target()"
    );

    dispose();
  });
});

test("custom absolute formatter", () => {
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

    assert.is(timeago(), "just now");

    setDate(p => p - 3 * MINUTE);
    assert.is(timeago(), "3 minutes ago");

    setDate(p => p - 2 * HOUR);
    assert.is(timeago(), "absolute", "absolute formatter should be appled");
    assert.is(capturedDate, target(), "captured date should math the target()");

    dispose();
  });
});

test("custom messages", () => {
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

    assert.is(timeago(), "NOW");

    setDate(p => p - 3 * MINUTE);
    assert.is(timeago(), "3 minutes ago");

    setDate(p => p - 2 * DAY);
    assert.is(timeago(), "2 DAYS ago");

    setDate(p => p + 1 * WEEK + 2 * DAY);
    assert.is(timeago(), "in the next week");

    setDate(p => p + 1 * WEEK);
    assert.is(timeago(), "in the next 2 weeks");

    setDate(p => p + 2 * MONTH);
    assert.is(timeago(), "in the next 2 months");

    setDate(p => p - YEAR - 2 * MONTH);
    assert.is(timeago(), "last year");

    setDate(p => p - YEAR);
    assert.is(timeago(), "2 years ago");

    dispose();
  });
});

test.run();
