import "temporal-polyfill/global";
import { describe, it, expect } from "vitest";
import { durationEquals, formatRelativeTime, temporalEquals } from "../src/index.js";

const D = (d: Temporal.DurationLike | string) => Temporal.Duration.from(d);

describe("durationEquals", () => {
  it("compares by length, not shape", () => {
    expect(durationEquals(D("PT60M"), D("PT1H"))).toBe(true);
    expect(durationEquals(D({ days: 1 }), D({ hours: 24 }))).toBe(true);
    expect(durationEquals(D("PT1H"), D("PT61M"))).toBe(false);
  });

  it("needs relativeTo to compare calendar units by length", () => {
    expect(durationEquals(D("P1M"), D("P31D"))).toBe(false);
    expect(durationEquals(D("P1M"), D("P1M"))).toBe(true);
    expect(durationEquals(D("P1M"), D("P31D"), Temporal.PlainDate.from("2026-01-01"))).toBe(true);
    expect(durationEquals(D("P1M"), D("P31D"), Temporal.PlainDate.from("2026-02-01"))).toBe(false);
  });
});

describe("temporalEquals", () => {
  it("compares values, not references", () => {
    const a = Temporal.PlainDate.from("2026-01-01");
    expect(temporalEquals(a, Temporal.PlainDate.from("2026-01-01"))).toBe(true);
    expect(temporalEquals(a, a.add({ days: 1 }))).toBe(false);
  });

  it("treats the same instant in different zones as different values", () => {
    const utc = Temporal.ZonedDateTime.from("2026-01-01T00:00[UTC]");
    expect(temporalEquals(utc, utc.withTimeZone("Asia/Tokyo"))).toBe(false);
  });

  it("is false across Temporal types", () => {
    const date = Temporal.PlainDate.from("2026-01-01");
    expect(
      temporalEquals<Temporal.PlainDate | Temporal.PlainDateTime>(date, date.toPlainDateTime()),
    ).toBe(false);
  });

  it("uses durationEquals for durations", () => {
    expect(temporalEquals(D("PT60M"), D("PT1H"))).toBe(true);
  });
});

describe("formatRelativeTime", () => {
  const now = Temporal.ZonedDateTime.from("2026-03-07T12:00:00[UTC]");
  const f = (d: Temporal.DurationLike, options?: Parameters<typeof formatRelativeTime>[2]) =>
    formatRelativeTime(D(d), now, { locale: "en", ...options });

  it("renders durations below the threshold as now", () => {
    expect(f({ seconds: 10 })).toBe("now");
    expect(f({ seconds: -59 })).toBe("now");
    expect(f({ seconds: 10 }, { justNow: "just now" })).toBe("just now");
    expect(f({ seconds: 10 }, { threshold: { seconds: 5 } })).toBe("in 10 seconds");
  });

  it("picks the largest unit and rounds by the remainder", () => {
    expect(f({ minutes: 5 })).toBe("in 5 minutes");
    expect(f({ hours: -3 })).toBe("3 hours ago");
    expect(f({ hours: 2, minutes: 31 })).toBe("in 3 hours");
    expect(f({ hours: 44 })).toBe("in 2 days");
    expect(f({ days: -20 })).toBe("3 weeks ago");
    expect(f({ months: 11, days: 20 })).toBe("next year");
  });

  it("uses calendar words with numeric: auto", () => {
    expect(f({ days: 1 })).toBe("tomorrow");
    expect(f({ days: -1 })).toBe("yesterday");
    expect(f({ days: 2 })).toBe("in 2 days");
    expect(f({ months: -1 })).toBe("last month");
    expect(f({ days: 1 }, { numeric: "always" })).toBe("in 1 day");
  });

  it("counts days by the calendar", () => {
    // from noon, the start of yesterday is 36 hours back
    expect(f({ hours: -36 })).toBe("yesterday");
    expect(f({ hours: 44 })).toBe("in 2 days");
    expect(f({ days: 6, hours: 13 })).toBe("next week");
  });

  it("measures months relative to the given date", () => {
    // 2026-03-07 -> 2026-04-07 is one month (31 days)
    expect(f({ days: 31 })).toBe("next month");
    // 2026-03-07 -> 2026-02-07 is one month back (28 days)
    expect(f({ days: -28 })).toBe("last month");
  });

  it("is localized", () => {
    expect(f({ days: -2 }, { locale: "es" })).toBe("anteayer");
    expect(f({ seconds: 1 }, { locale: "es" })).toBe("ahora");
    expect(f({ hours: 3 }, { locale: "de", style: "short" })).toBe("in 3 Std.");
  });
});
