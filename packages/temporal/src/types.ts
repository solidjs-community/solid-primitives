import type { TimeoutSource } from "@solid-primitives/timer";
import type { MaybeAccessor } from "@solid-primitives/utils";

export type { TimeoutSource };

/** Every Temporal type whose values can be compared with `.equals()`. */
export type TemporalValue =
  | Temporal.Instant
  | Temporal.ZonedDateTime
  | Temporal.PlainDateTime
  | Temporal.PlainDate
  | Temporal.PlainTime
  | Temporal.PlainYearMonth
  | Temporal.PlainMonthDay;

/** Every Temporal type that can be differenced with `.until()`. */
export type DiffableTemporal = Exclude<TemporalValue, Temporal.PlainMonthDay>;

/** The options `.until()` accepts for a given Temporal type, e.g. `{ largestUnit: "months" }`. */
export type DifferenceOptions<T extends DiffableTemporal> = NonNullable<Parameters<T["until"]>[1]>;

/** A Temporal value usable as `relativeTo` when comparing, rounding or totaling durations. */
export type RelativeTo = Temporal.ZonedDateTime | Temporal.PlainDateTime | Temporal.PlainDate;

export interface RelativeTimeFormatOptions extends Intl.RelativeTimeFormatOptions {
  /**
   * Locale(s) passed to `Intl.RelativeTimeFormat`.
   *
   * @default the runtime's default locale
   */
  locale?: Intl.LocalesArgument;

  /**
   * Durations shorter than this render as {@link justNow}.
   *
   * @default { minutes: 1 }
   */
  threshold?: Temporal.DurationLike;

  /**
   * Text used for durations shorter than {@link threshold}.
   *
   * @default the localized "now" from `Intl.RelativeTimeFormat` (e.g. `"now"`, `"ahora"`)
   */
  justNow?: string;
}

/**
 * Decides how often {@link createRelativeTime} refreshes **now**, based on the current
 * distance to the target. Return `false` to stop auto-updating.
 */
export type GetUpdateInterval = (
  difference: Temporal.Duration,
  now: Temporal.ZonedDateTime,
) => number | false;

export interface RelativeTimeOptions extends RelativeTimeFormatOptions {
  /**
   * Time zone that decides calendar boundaries such as "yesterday" or "last month".
   * *May be a reactive signal.*
   *
   * @default the runtime's time zone (`Temporal.Now.timeZoneId()`)
   */
  timeZone?: MaybeAccessor<string>;

  /**
   * How often to refresh **now**, in ms. A number, a signal, or a function of the current
   * difference. `false` or `0` disables auto-updating.
   *
   * @default 30 seconds while the target is within an hour, 30 minutes otherwise
   */
  interval?: TimeoutSource | GetUpdateInterval;
}
