import type { RelativeTimeFormatOptions, RelativeTo, TemporalValue } from "./types.ts";

/**
 * The current instant, read from `Date.now()`.
 *
 * `Temporal.Now.instant()` would add sub-millisecond precision that no UI clock needs, and
 * reading `Date.now()` keeps "now" on the same clock as the `setTimeout`/`setInterval` timers
 * driving the updates — which is also the clock test runners know how to fake.
 *
 * @internal
 */
export const currentInstant = (): Temporal.Instant =>
  Temporal.Instant.fromEpochMilliseconds(Date.now());

/**
 * The runtime's current time zone id, e.g. `"Europe/Warsaw"`.
 *
 * @internal
 */
export const currentTimeZone = (): string => Temporal.Now.timeZoneId();

const hasCalendarUnits = (d: Temporal.Duration): boolean =>
  d.years !== 0 || d.months !== 0 || d.weeks !== 0;

/**
 * Compares two durations by length rather than by shape, so `PT60M` equals `PT1H`.
 *
 * Years, months and weeks have no fixed length, so they can only be compared against a
 * `relativeTo` date. Without one, durations that use them are equal only if every field is.
 *
 * @example
 * ```ts
 * durationEquals(Temporal.Duration.from("PT60M"), Temporal.Duration.from("PT1H")); // true
 * // January has 31 days
 * durationEquals(
 *   Temporal.Duration.from("P1M"),
 *   Temporal.Duration.from("P31D"),
 *   Temporal.PlainDate.from("2026-01-01"),
 * ); // true
 * ```
 */
export function durationEquals(
  a: Temporal.Duration,
  b: Temporal.Duration,
  relativeTo?: RelativeTo,
): boolean {
  if (a === b) return true;
  if (!relativeTo && (hasCalendarUnits(a) || hasCalendarUnits(b)))
    return a.toString() === b.toString();
  return Temporal.Duration.compare(a, b, relativeTo && { relativeTo }) === 0;
}

/**
 * Compares two Temporal values of the same type with `.equals()`; durations are compared with
 * {@link durationEquals}. Values of different Temporal types are never equal.
 *
 * Used as the `equals` option of every signal in this package, since two Temporal objects
 * holding the same value are never `===`.
 */
export function temporalEquals<T extends TemporalValue | Temporal.Duration>(a: T, b: T): boolean {
  if (a === b) return true;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (a instanceof Temporal.Duration) return durationEquals(a, b as Temporal.Duration);
  return (a as { equals(other: T): boolean }).equals(b);
}

/** Units in the order {@link formatRelativeTime} picks them, largest first. */
const UNITS = ["years", "months", "weeks", "days", "hours", "minutes", "seconds"] as const;
type RelativeUnit = (typeof UNITS)[number];

const DEFAULT_THRESHOLD: Temporal.DurationLike = { minutes: 1 };

const leadingUnit = (d: Temporal.Duration): RelativeUnit | undefined =>
  UNITS.find(unit => d[unit] !== 0);

const toPlainDate = (date: RelativeTo): Temporal.PlainDate =>
  date instanceof Temporal.PlainDate ? date : date.toPlainDate();

/** @internal */
export const makeRelativeTimeFormat = (
  options: RelativeTimeFormatOptions,
): Intl.RelativeTimeFormat => {
  const { locale, threshold: _, justNow: __, ...intl } = options;
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto", ...intl });
};

/**
 * {@link formatRelativeTime} with a prebuilt formatter, so reactive callers don't construct a
 * new `Intl.RelativeTimeFormat` on every update.
 *
 * @internal
 */
export function formatWith(
  format: Intl.RelativeTimeFormat,
  duration: Temporal.Duration,
  relativeTo: RelativeTo,
  threshold: Temporal.DurationLike = DEFAULT_THRESHOLD,
  justNow?: string,
): string {
  const now = () => justNow ?? format.format(0, "seconds");
  if (Temporal.Duration.compare(duration.abs(), threshold, { relativeTo }) < 0) return now();

  const balanced = duration.round({ largestUnit: "years", smallestUnit: "seconds", relativeTo });
  const unit = leadingUnit(balanced);
  if (!unit) return now();

  // Round to the leading unit, letting the remainder carry it over:
  // "1 day 20 hours" -> "2 days", "11 months 20 days" -> "1 year".
  const rounded = balanced.round({
    largestUnit: "years",
    smallestUnit: unit,
    roundingMode: "halfExpand",
    relativeTo,
  });
  const roundedUnit = leadingUnit(rounded)!;
  if (roundedUnit !== "days") return format.format(rounded[roundedUnit], roundedUnit);

  // Count days by the calendar, not by 24-hour periods: at noon, midnight the day before is
  // "yesterday" even though it is 36 hours away.
  const days = toPlainDate(relativeTo).until(toPlainDate(relativeTo.add(duration)), {
    largestUnit: "days",
  }).days;

  // Balancing to years never produces weeks; express 7+ days in weeks, as people do.
  return Math.abs(days) >= 7
    ? format.format(Math.round(days / 7), "weeks")
    : format.format(days, "days");
}

/**
 * Formats a duration as localized relative time, e.g. *"3 hours ago"*, *"tomorrow"*,
 * *"in 2 weeks"*, using `Intl.RelativeTimeFormat`.
 *
 * The duration is rounded to its largest non-zero unit, except that days are counted by the
 * calendar: at noon, midnight the day before is *"yesterday"*, not *"2 days ago"*.
 * `relativeTo` (usually **now**) is required because months, years and days have no fixed
 * length.
 *
 * `numeric` defaults to `"auto"` (*"yesterday"* rather than *"1 day ago"*).
 *
 * @param duration signed distance from `relativeTo`; negative is in the past
 * @param relativeTo the date the duration is measured from
 * @param options locale, `Intl.RelativeTimeFormat` options, `threshold` and `justNow`
 *
 * @example
 * ```ts
 * const now = Temporal.Now.zonedDateTimeISO();
 * formatRelativeTime(Temporal.Duration.from({ hours: -3 }), now); // "3 hours ago"
 * formatRelativeTime(Temporal.Duration.from({ days: 1 }), now); // "tomorrow"
 * formatRelativeTime(Temporal.Duration.from({ days: -2 }), now, { locale: "es" }); // "anteayer"
 * ```
 */
export const formatRelativeTime = (
  duration: Temporal.Duration,
  relativeTo: RelativeTo,
  options: RelativeTimeFormatOptions = {},
): string =>
  formatWith(
    makeRelativeTimeFormat(options),
    duration,
    relativeTo,
    options.threshold,
    options.justNow,
  );
