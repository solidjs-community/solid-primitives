import { makeTimer } from "@solid-primitives/timer";
import { access, type MaybeAccessor, noop } from "@solid-primitives/utils";
import { isServer } from "@solidjs/web";
import { type Accessor, createEffect, createMemo, createSignal, type Signal } from "solid-js";
import type {
  DiffableTemporal,
  DifferenceOptions,
  GetUpdateInterval,
  RelativeTimeOptions,
  RelativeTo,
  TemporalValue,
  TimeoutSource,
} from "./types.ts";
import {
  currentInstant,
  currentTimeZone,
  durationEquals,
  formatWith,
  makeRelativeTimeFormat,
  temporalEquals,
} from "./utils.ts";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/**
 * Calls `fn` every `interval` ms while the interval is truthy.
 *
 * The effect is created on the server too (it just never schedules anything there): a
 * render-body effect takes a hydration id, so creating it only on the client would misalign
 * every id after it. `createTimer` from `@solid-primitives/timer` returns early on the server,
 * which is why it isn't used here.
 */
function createInterval(fn: VoidFunction, interval: TimeoutSource): void {
  createEffect(
    () => (typeof interval === "function" ? interval() : interval),
    delay => {
      if (isServer || !delay) return;
      return makeTimer(fn, delay, setInterval);
    },
  );
}

/**
 * Creates a signal holding a Temporal value.
 *
 * Temporal objects are immutable, so every change is a new object — the signal compares
 * values with {@link temporalEquals} instead of `===`, and setting an equal value is a no-op.
 *
 * @param init initial value; *may be a reactive signal*, in which case the signal resets
 * whenever it changes (like `createSignal(fn)`)
 * @returns `[value, setValue]`
 *
 * @example
 * ```ts
 * const [date, setDate] = createTemporal(Temporal.PlainDate.from("2026-01-31"));
 * setDate(d => d.add({ months: 1 })); // 2026-02-28
 * setDate(Temporal.PlainDate.from("2026-02-28")); // equal value, no update
 * ```
 */
export function createTemporal<T extends TemporalValue | Temporal.Duration>(
  init: MaybeAccessor<T>,
): Signal<T> {
  const options = { equals: temporalEquals<T> };
  return typeof init === "function"
    ? createSignal<T>(() => init(), options)
    : createSignal<T>(init as Exclude<T, Function>, options);
}

/**
 * Creates an auto-updating `Temporal.Instant` of **now**.
 *
 * On the server it holds the instant of rendering and never updates.
 *
 * @param interval delay in ms between updates; *may be a reactive signal*.
 * `false` or `0` disables auto-updating. *Default = `30000`*
 * @returns `[now, update]` — call `update()` to refresh manually
 *
 * @example
 * ```ts
 * const [now] = createInstantNow(1000);
 * now().epochMilliseconds;
 * ```
 */
export function createInstantNow(
  interval: TimeoutSource = MINUTE / 2,
): [now: Accessor<Temporal.Instant>, update: VoidFunction] {
  const [now, setNow] = createSignal<Temporal.Instant>(currentInstant(), {
    equals: temporalEquals,
  });
  // Writing on the server is an error; there is nothing to update there anyway.
  const update = isServer ? noop : () => void setNow(currentInstant());
  createInterval(update, interval);
  return [now, update];
}

/**
 * Creates an auto-updating `Temporal.ZonedDateTime` of **now** in a time zone.
 *
 * Pass an explicit time zone when server rendering: the server's zone is usually not the
 * visitor's.
 *
 * @param timeZone IANA time zone id; *may be a reactive signal*.
 * *Default = the runtime's time zone*
 * @param interval delay in ms between updates; *may be a reactive signal*.
 * `false` or `0` disables auto-updating. *Default = `30000`*
 * @returns `[now, update]` — call `update()` to refresh manually
 *
 * @example
 * ```ts
 * const [timeZone, setTimeZone] = createSignal("Europe/Warsaw");
 * const [now] = createZonedDateTimeNow(timeZone, 1000);
 * now().hour;
 * setTimeZone("Asia/Tokyo"); // now() switches zone immediately
 * ```
 */
export function createZonedDateTimeNow(
  timeZone: MaybeAccessor<string> = currentTimeZone,
  interval: TimeoutSource = MINUTE / 2,
): [now: Accessor<Temporal.ZonedDateTime>, update: VoidFunction] {
  const [instant, update] = createInstantNow(interval);
  const now = createMemo(() => instant().toZonedDateTimeISO(access(timeZone)), {
    equals: temporalEquals,
  });
  return [now, update];
}

/**
 * Creates an auto-updating `Temporal.PlainDate` of today in a time zone.
 *
 * Rather than polling, it sets one timer for the moment the zone's next day starts, which
 * Temporal computes correctly across daylight saving changes and in zones where a day does
 * not start at midnight.
 *
 * @param timeZone IANA time zone id; *may be a reactive signal*.
 * *Default = the runtime's time zone*
 * @returns today's date
 *
 * @example
 * ```ts
 * const today = createToday("America/New_York");
 * today().toString(); // "2026-03-08"
 * ```
 */
export function createToday(
  timeZone: MaybeAccessor<string> = currentTimeZone,
): Accessor<Temporal.PlainDate> {
  const read = () => currentInstant().toZonedDateTimeISO(access(timeZone)).toPlainDate();

  // Created on the server too, so both sides allocate the same hydration ids.
  const [tick, setTick] = createSignal(0);
  const today = createMemo(() => (tick(), read()), { equals: temporalEquals });

  createEffect(
    // Track `tick` too: if the timer fires before the date has changed (the system clock was
    // adjusted), `today` stays equal and wouldn't re-run this effect to schedule the next one.
    () => (tick(), { date: today(), zone: access(timeZone) }),
    ({ date, zone }) => {
      if (isServer) return;
      const nextDay = date.add({ days: 1 }).toZonedDateTime(zone);
      const delay = Math.max(0, nextDay.epochMilliseconds - Date.now());
      return makeTimer(() => setTick(t => t + 1), delay, setTimeout);
    },
  );

  return today;
}

const isRelativeTo = (value: unknown): value is RelativeTo =>
  value instanceof Temporal.ZonedDateTime ||
  value instanceof Temporal.PlainDateTime ||
  value instanceof Temporal.PlainDate;

const shallowEqual = (a: object | undefined, b: object | undefined): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  const keys = Object.keys(a) as (keyof typeof a)[];
  return keys.length === Object.keys(b).length && keys.every(key => a[key] === b[key]);
};

/**
 * Creates a reactive `Temporal.Duration` from `from` to `to` (`from.until(to)`).
 *
 * Unlike millisecond arithmetic it is calendar-aware: from January 31 to March 31 is
 * `P2M` with `largestUnit: "months"`, and a day across a daylight saving change is still
 * one day for `ZonedDateTime`.
 *
 * The duration only notifies when its *length* changes — compared with
 * {@link durationEquals} relative to `from` — or when `options` change.
 *
 * @param from start; *may be a reactive signal*
 * @param to end, of the same Temporal type as `from`; *may be a reactive signal*
 * @param options `.until()` options, e.g. `{ largestUnit: "days", smallestUnit: "seconds" }`;
 * *may be a reactive signal*
 * @returns the duration, negative when `to` is before `from`
 *
 * @example
 * ```ts
 * // a countdown
 * const [now] = createZonedDateTimeNow(undefined, 1000);
 * const launch = Temporal.ZonedDateTime.from("2027-01-01T00:00[Europe/Warsaw]");
 * const remaining = createDuration(now, launch, { largestUnit: "days", smallestUnit: "seconds" });
 * remaining().days; remaining().hours; remaining().minutes; remaining().seconds;
 * ```
 */
export function createDuration<T extends DiffableTemporal>(
  from: MaybeAccessor<T>,
  to: MaybeAccessor<T>,
  options?: MaybeAccessor<DifferenceOptions<T> | undefined>,
): Accessor<Temporal.Duration> {
  // Read by `equals`, which runs right after each computation.
  let relativeTo: RelativeTo | undefined;
  let optionsChanged = true;
  let prevOptions: DifferenceOptions<T> | undefined;

  return createMemo(
    () => {
      const start = access(from);
      const opts = access(options);
      optionsChanged = !shallowEqual(opts, prevOptions);
      prevOptions = opts;
      relativeTo = isRelativeTo(start) ? start : undefined;
      return (start.until as (other: T, options?: DifferenceOptions<T>) => Temporal.Duration)(
        access(to),
        opts,
      );
    },
    {
      // A change of options can produce an equally long duration in a different shape
      // (`PT1H` -> `PT60M`); that must notify, or readers of `.minutes` would see stale data.
      equals: (prev, next) =>
        prev !== undefined && !optionsChanged && durationEquals(prev, next, relativeTo),
    },
  );
}

const defaultInterval = (difference: Temporal.Duration, now: Temporal.ZonedDateTime) =>
  Math.abs(difference.total({ unit: "milliseconds", relativeTo: now })) <= HOUR
    ? MINUTE / 2
    : HOUR / 2;

/**
 * Creates an auto-updating, localized relative time string for a target, e.g.
 * *"5 minutes ago"*, *"yesterday"*, *"in 3 weeks"*, using `Intl.RelativeTimeFormat`.
 *
 * Calendar words like *"yesterday"* and *"last month"* are decided in `options.timeZone`.
 *
 * @param target the date to describe; *may be a reactive signal*
 * @param options locale and `Intl.RelativeTimeFormat` options, `threshold`, `justNow`,
 * `timeZone` and the update `interval`. Read once, except the reactive `timeZone`.
 * @returns `[text, { now, difference, update }]`
 *
 * @example
 * ```ts
 * const [published] = createSignal(Temporal.Instant.from("2026-11-20T09:00:00Z"));
 * const [text, { difference }] = createRelativeTime(published, { locale: "en" });
 * text(); // "3 hours ago"
 * ```
 */
export function createRelativeTime(
  target: MaybeAccessor<Temporal.Instant | Temporal.ZonedDateTime>,
  options: RelativeTimeOptions = {},
): [
  text: Accessor<string>,
  extra: {
    now: Accessor<Temporal.ZonedDateTime>;
    difference: Accessor<Temporal.Duration>;
    update: VoidFunction;
  },
] {
  const { timeZone = currentTimeZone, interval = defaultInterval, threshold, justNow } = options;
  const format = makeRelativeTimeFormat(options);

  // `now` is driven by a timer created below, once `difference` exists for the interval to read.
  const [now, update] = createZonedDateTimeNow(timeZone, 0);

  const difference = createMemo(() => {
    const start = now();
    const end = access(target);
    return start.until(
      end instanceof Temporal.Instant
        ? end.toZonedDateTimeISO(start.timeZoneId)
        : end.withTimeZone(start.timeZoneId),
      { largestUnit: "years" },
    );
  });

  const text = createMemo(() => formatWith(format, difference(), now(), threshold, justNow));

  createInterval(
    update,
    typeof interval === "function"
      ? () => (interval as GetUpdateInterval)(difference(), now())
      : interval,
  );

  return [text, { now, difference, update }];
}
