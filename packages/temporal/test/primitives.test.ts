import "temporal-polyfill/global";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createEffect, createRoot, createSignal, flush } from "solid-js";
import {
  createTemporal,
  createInstantNow,
  createZonedDateTimeNow,
  createToday,
  createDuration,
  createRelativeTime,
} from "../src/index.js";

const START = "2026-03-07T12:00:00Z";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(START));
});

afterEach(() => {
  vi.useRealTimers();
});

/** Counts how many times `read` notifies, after the initial run. */
function countUpdates(read: () => unknown): { count: () => number } {
  let runs = -1;
  createEffect(read, () => {
    runs++;
  });
  return { count: () => runs };
}

describe("createTemporal", () => {
  it("ignores equal values", () => {
    const { date, setDate, updates, dispose } = createRoot(dispose => {
      const [date, setDate] = createTemporal(Temporal.PlainDate.from("2026-01-31"));
      return { date, setDate, updates: countUpdates(date), dispose };
    });
    flush();
    const initial = date();

    setDate(Temporal.PlainDate.from("2026-01-31"));
    flush();
    expect(date()).toBe(initial);
    expect(updates.count()).toBe(0);

    setDate(d => d.add({ months: 1 }));
    flush();
    expect(date().toString()).toBe("2026-02-28");
    expect(updates.count()).toBe(1);
    dispose();
  });

  it("resets when a reactive initial value changes", () => {
    const [source, setSource] = createSignal(Temporal.PlainTime.from("09:00"));
    const { time, setTime, dispose } = createRoot(dispose => {
      const [time, setTime] = createTemporal(source);
      return { time, setTime, dispose };
    });
    setTime(t => t.add({ hours: 1 }));
    flush();
    expect(time().toString()).toBe("10:00:00");

    setSource(Temporal.PlainTime.from("12:30"));
    flush();
    expect(time().toString()).toBe("12:30:00");
    dispose();
  });
});

describe("createInstantNow", () => {
  it("starts at now and auto-updates", () => {
    const { now, dispose } = createRoot(dispose => {
      const [now] = createInstantNow(1000);
      return { now, dispose };
    });
    flush(); // run the initial effect, which starts the interval
    expect(now().toString()).toBe(START);

    vi.advanceTimersByTime(1000);
    flush();
    expect(now().toString()).toBe("2026-03-07T12:00:01Z");
    dispose();
  });

  it("updates manually and can be disabled", () => {
    const { now, update, dispose } = createRoot(dispose => {
      const [now, update] = createInstantNow(0);
      return { now, update, dispose };
    });
    vi.advanceTimersByTime(60_000);
    flush();
    expect(now().toString()).toBe(START);

    update();
    flush();
    expect(now().toString()).toBe("2026-03-07T12:01:00Z");
    dispose();
  });

  it("follows a reactive interval", () => {
    const [interval, setInterval] = createSignal<number | false>(false);
    const { now, dispose } = createRoot(dispose => {
      const [now] = createInstantNow(interval);
      return { now, dispose };
    });
    flush();
    vi.advanceTimersByTime(5000);
    flush();
    expect(now().toString()).toBe(START);

    setInterval(1000);
    flush();
    vi.advanceTimersByTime(1000);
    flush();
    expect(now().toString()).toBe("2026-03-07T12:00:06Z");

    setInterval(0);
    flush();
    vi.advanceTimersByTime(5000);
    flush();
    expect(now().toString()).toBe("2026-03-07T12:00:06Z");
    dispose();
  });

  it("stops updating when disposed", () => {
    const { dispose } = createRoot(dispose => {
      createInstantNow(1000);
      return { dispose };
    });
    flush();
    dispose();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("createZonedDateTimeNow", () => {
  it("reacts to time zone changes", () => {
    const [timeZone, setTimeZone] = createSignal("UTC");
    const { now, dispose } = createRoot(dispose => {
      const [now] = createZonedDateTimeNow(timeZone, 1000);
      return { now, dispose };
    });
    expect(now().toString()).toBe("2026-03-07T12:00:00+00:00[UTC]");

    setTimeZone("Asia/Tokyo");
    flush();
    expect(now().toString()).toBe("2026-03-07T21:00:00+09:00[Asia/Tokyo]");

    vi.advanceTimersByTime(1000);
    flush();
    expect(now().second).toBe(1);
    dispose();
  });
});

describe("createToday", () => {
  it("changes exactly when the zone's next day starts, across daylight saving", () => {
    // 2026-03-08 is only 23 hours long in New York (DST starts at 02:00)
    vi.setSystemTime(new Date("2026-03-08T04:59:00Z")); // 23:59 on Mar 7, EST
    const { today, updates, dispose } = createRoot(dispose => {
      const today = createToday("America/New_York");
      return { today, updates: countUpdates(today), dispose };
    });
    flush();
    expect(today().toString()).toBe("2026-03-07");

    vi.advanceTimersByTime(59_999);
    flush();
    expect(today().toString()).toBe("2026-03-07");

    vi.advanceTimersByTime(1);
    flush();
    expect(today().toString()).toBe("2026-03-08");

    vi.advanceTimersByTime(23 * 3_600_000 - 1);
    flush();
    expect(today().toString()).toBe("2026-03-08");

    vi.advanceTimersByTime(1);
    flush();
    expect(today().toString()).toBe("2026-03-09");
    expect(updates.count()).toBe(2);
    dispose();
  });

  it("handles zones whose day doesn't start at midnight", () => {
    // Santiago skips 00:00 -> 01:00 on 2026-09-06, so that day starts at 01:00
    vi.setSystemTime(new Date("2026-09-06T03:59:00Z")); // 23:59 on Sep 5, -04:00
    const { today, dispose } = createRoot(dispose => ({
      today: createToday("America/Santiago"),
      dispose,
    }));
    flush();
    expect(today().toString()).toBe("2026-09-05");

    vi.advanceTimersByTime(60_000);
    flush();
    expect(today().toString()).toBe("2026-09-06");
    dispose();
  });

  it("re-schedules when the time zone changes", () => {
    // 12:00 UTC is 21:00 in Tokyo, so Tokyo's next day is 3 hours away
    const [timeZone, setTimeZone] = createSignal("UTC");
    const { today, dispose } = createRoot(dispose => ({ today: createToday(timeZone), dispose }));
    flush();
    expect(today().toString()).toBe("2026-03-07");

    setTimeZone("Asia/Tokyo");
    flush();
    expect(today().toString()).toBe("2026-03-07");

    vi.advanceTimersByTime(3 * 3_600_000);
    flush();
    expect(today().toString()).toBe("2026-03-08");
    expect(vi.getTimerCount()).toBe(1);
    dispose();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("createDuration", () => {
  it("is calendar-aware", () => {
    const [to, setTo] = createSignal(Temporal.PlainDate.from("2026-03-31"));
    const { duration, dispose } = createRoot(dispose => ({
      duration: createDuration(Temporal.PlainDate.from("2026-01-31"), to, {
        largestUnit: "months",
      }),
      dispose,
    }));
    expect(duration().toString()).toBe("P2M");

    setTo(Temporal.PlainDate.from("2027-02-28"));
    flush();
    expect(duration().toString()).toBe("P12M28D");
    dispose();
  });

  it("counts a daylight saving day as one day", () => {
    const from = Temporal.ZonedDateTime.from("2026-03-07T12:00[America/New_York]");
    const { duration, dispose } = createRoot(dispose => ({
      duration: createDuration(from, from.add({ days: 1 }), { largestUnit: "days" }),
      dispose,
    }));
    expect(duration().toString()).toBe("P1D");
    dispose();
  });

  it("only notifies when the length changes", () => {
    const [from, setFrom] = createSignal(Temporal.Instant.from("2026-01-01T00:00:00Z"));
    const [to, setTo] = createSignal(Temporal.Instant.from("2026-01-01T01:00:00Z"));
    const { duration, updates, dispose } = createRoot(dispose => {
      const duration = createDuration(from, to, { largestUnit: "hours" });
      return { duration, updates: countUpdates(duration), dispose };
    });
    flush();

    // both shift by the same amount: same length
    setFrom(f => f.add({ minutes: 5 }));
    setTo(t => t.add({ minutes: 5 }));
    flush();
    expect(updates.count()).toBe(0);

    setTo(t => t.add({ minutes: 5 }));
    flush();
    expect(updates.count()).toBe(1);
    expect(duration().toString()).toBe("PT1H5M");
    dispose();
  });

  it("notifies when options reshape an equally long duration", () => {
    const [options, setOptions] = createSignal<{ largestUnit: "hours" | "minutes" }>({
      largestUnit: "hours",
    });
    const { duration, dispose } = createRoot(dispose => ({
      duration: createDuration(
        Temporal.Instant.from("2026-01-01T00:00:00Z"),
        Temporal.Instant.from("2026-01-01T01:00:00Z"),
        options,
      ),
      dispose,
    }));
    expect(duration().toString()).toBe("PT1H");

    setOptions({ largestUnit: "minutes" });
    flush();
    expect(duration().toString()).toBe("PT60M");
    dispose();
  });

  it("composes with now into a countdown", () => {
    const launch = Temporal.ZonedDateTime.from("2026-03-08T13:02:03[UTC]");
    const { remaining, dispose } = createRoot(dispose => {
      const [now] = createZonedDateTimeNow("UTC", 1000);
      const remaining = createDuration(now, launch, {
        largestUnit: "days",
        smallestUnit: "seconds",
      });
      return { remaining, dispose };
    });
    flush();
    expect(remaining().toString()).toBe("P1DT1H2M3S");

    vi.advanceTimersByTime(3000);
    flush();
    expect(remaining().toString()).toBe("P1DT1H2M");
    dispose();
  });
});

describe("createRelativeTime", () => {
  it("auto-updates as now moves past the target", () => {
    const target = Temporal.Instant.from("2026-03-07T12:05:00Z");
    const { text, difference, dispose } = createRoot(dispose => {
      const [text, { difference }] = createRelativeTime(target, {
        locale: "en",
        timeZone: "UTC",
        interval: 60_000,
      });
      return { text, difference, dispose };
    });
    flush();
    expect(text()).toBe("in 5 minutes");
    expect(difference().toString()).toBe("PT5M");

    vi.advanceTimersByTime(10 * 60_000);
    flush();
    expect(text()).toBe("5 minutes ago");
    dispose();
  });

  it("reacts to the target", () => {
    const [target, setTarget] = createSignal<Temporal.Instant | Temporal.ZonedDateTime>(
      Temporal.Instant.from(START),
    );
    const { text, dispose } = createRoot(dispose => ({
      text: createRelativeTime(target, { locale: "en", timeZone: "UTC" })[0],
      dispose,
    }));
    expect(text()).toBe("now");

    setTarget(Temporal.ZonedDateTime.from("2026-03-06T09:00[Asia/Tokyo]"));
    flush();
    expect(text()).toBe("yesterday");
    dispose();
  });

  it("measures calendar days in the given time zone", () => {
    // New York springs forward on 2026-03-08: 08:00 Mar 7 EST -> 08:00 Mar 8 EDT is one
    // calendar day there, but only 23 hours of elapsed time.
    vi.setSystemTime(new Date("2026-03-08T12:00:00Z"));
    const target = Temporal.Instant.from("2026-03-07T13:00:00Z");
    const [timeZone, setTimeZone] = createSignal("UTC");
    const { text, dispose } = createRoot(dispose => ({
      text: createRelativeTime(target, { locale: "en", timeZone })[0],
      dispose,
    }));
    expect(text()).toBe("23 hours ago");

    setTimeZone("America/New_York");
    flush();
    expect(text()).toBe("yesterday");
    dispose();
  });

  it("asks a function for the update interval", () => {
    const target = Temporal.Instant.from("2026-03-07T12:30:00Z");
    const interval = vi.fn((difference: Temporal.Duration) =>
      difference.sign > 0 ? 60_000 : (false as const),
    );
    const { text, dispose } = createRoot(dispose => ({
      text: createRelativeTime(target, { locale: "en", timeZone: "UTC", interval })[0],
      dispose,
    }));
    flush();
    expect(interval).toHaveBeenCalled();
    expect(text()).toBe("in 30 minutes");

    vi.advanceTimersByTime(31 * 60_000);
    flush();
    expect(text()).toBe("1 minute ago");

    // the difference is now negative, so auto-updating stopped
    vi.advanceTimersByTime(60 * 60_000);
    flush();
    expect(text()).toBe("1 minute ago");
    dispose();
  });
});
