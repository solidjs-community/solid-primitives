import { Accessor, createEffect, createMemo, createSignal, on, onCleanup } from "solid-js";
import { access, Fn, MaybeAccessor } from "./common";

export type MessageFormatter<T = number> = (value: T, isPast: boolean) => string;

export interface DateDifferenceMessages {
  justNow: string;
  past: string | MessageFormatter<string>;
  future: string | MessageFormatter<string>;
  year: string | MessageFormatter<number>;
  month: string | MessageFormatter<number>;
  day: string | MessageFormatter<number>;
  week: string | MessageFormatter<number>;
  hour: string | MessageFormatter<number>;
  minute: string | MessageFormatter<number>;
  second: string | MessageFormatter<number>;
}

interface Unit {
  max: number;
  value: number;
  name: keyof DateDifferenceMessages;
}

export interface DateDifferenceOptions {
  /**
   * Intervals to update, set 0 to disable auto update
   *
   * @default (diff) => diff <= 3600_000 ? 30_000 : 1800_000
   */
  updateInterval?: number | ((diff: number) => number);

  /**
   * Minimum diff in milliseconds to display "just now" instead of relative time
   *
   * @default 60000
   */
  min?: number;

  /**
   * Maximum diff in milliseconds to display the full date instead of relative
   *
   * @default Infinite
   */
  max?: number;

  /**
   * Messages for formating the string
   */
  messages?: Partial<DateDifferenceMessages>;

  /**
   * Formatter for full date
   */
  absoluteFormatter?: (date: Date) => string;

  /**
   * Relative time formatter
   */
  relativeFormatter?: (target: Date, now: Date, diff: number) => string;
}

export const SECOND = 1000,
  MINUTE = 60_000,
  HOUR = 3_600_000,
  DAY = 86_400_000,
  WEEK = 604_800_000,
  MONTH = 2_592_000_000,
  YEAR = 31_536_000_000;

const UNITS: Unit[] = [
  { max: 60000, value: SECOND, name: "second" },
  { max: 2760000, value: MINUTE, name: "minute" },
  { max: 72000000, value: HOUR, name: "hour" },
  { max: 518400000, value: DAY, name: "day" },
  { max: 2419200000, value: WEEK, name: "week" },
  { max: 28512000000, value: MONTH, name: "month" },
  { max: Infinity, value: YEAR, name: "year" }
];

const DEFAULT_MESSAGES: DateDifferenceMessages = {
  justNow: "just now",
  past: n => (n.match(/\d/) ? `${n} ago` : n),
  future: n => (n.match(/\d/) ? `in ${n}` : n),
  month: (n, past) =>
    n === 1 ? (past ? "last month" : "next month") : `${n} month${n > 1 ? "s" : ""}`,
  year: (n, past) =>
    n === 1 ? (past ? "last year" : "next year") : `${n} year${n > 1 ? "s" : ""}`,
  day: (n, past) => (n === 1 ? (past ? "yesterday" : "tomorrow") : `${n} day${n > 1 ? "s" : ""}`),
  week: (n, past) =>
    n === 1 ? (past ? "last week" : "next week") : `${n} week${n > 1 ? "s" : ""}`,
  hour: n => `${n} hour${n > 1 ? "s" : ""}`,
  minute: n => `${n} minute${n > 1 ? "s" : ""}`,
  second: n => `${n} second${n > 1 ? "s" : ""}`
};

const DEFAULT_FORMATTER = (date: Date) => date.toISOString().slice(0, 10);

const DEFAULT_UPDATE_INTERVAL = (abs_diff: number) => (abs_diff <= HOUR ? MINUTE / 2 : HOUR / 2);

/**
 * Creates an autoupdating and reactive `new Date()`
 *
 * @param interval delay in ms for updating the date. Set to `0` to disable autoupdating. *Default = `30000`*
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/date-difference
 *
 * @example
 * ```ts
 * // updates every second:
 * const [now] = createDateNow(1000);
 *
 * // won't autoupdate:
 * const [now, update] = createDateNow(0);
 *
 * // update manually:
 * update()
 * ```
 */
export function createDateNow(interval: MaybeAccessor<number> = MINUTE / 2): [Accessor<Date>, Fn] {
  const [now, setNow] = createSignal(new Date());
  const update = () => setNow(new Date());
  let timer: NodeJS.Timer;
  createEffect(() => {
    clearInterval(timer);
    const ms = access(interval);
    // if interval === 0 the date won't update automatically
    if (ms) timer = setInterval(update, ms);
  });
  onCleanup(() => clearInterval(timer));
  return [now, update];
}

/**
 * Provides a reactive, formatted date difference in relation to now.
 *
 * @param date target date
 * @param options
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/date-difference
 *
 * @example
 * ```ts
 * const [myDate, setMyDate] = createSignal(new Date('Jun 28, 2021'))
 * const [timeago, { target, now, update }] = createDateDifference(myDate);
 * // => 5 months ago
 *
 * // use custom libraries to change formatting:
 * import { formatRelative } from "date-fns";
 * const [timeago] = createDateDifference(1577836800000, {
 *   min: 10000,
 *   updateInterval: 30000,
 *   relativeFormatter: (target, now) => formatRelative(target, now)
 * });
 * // => last Monday at 9:25 AM
 * ```
 */
export function createDateDifference(
  date: MaybeAccessor<number | Date | string>,
  options: DateDifferenceOptions = {}
): [
  Accessor<string>,
  {
    target: Accessor<Date>;
    now: Accessor<Date>;
    update: Fn;
  }
] {
  const {
    min = MINUTE,
    max = Infinity,
    updateInterval = DEFAULT_UPDATE_INTERVAL,
    absoluteFormatter = DEFAULT_FORMATTER,
    relativeFormatter
  } = options;
  // users don't need to set the whole messages object
  const messages: DateDifferenceMessages = Object.assign(DEFAULT_MESSAGES, options.messages);

  const target = createMemo(() => new Date(access(date)));
  const [interval, setInterval] = createSignal(0);
  const [now, update] = createDateNow(interval);
  const diff = createMemo(() => target().getTime() - now().getTime());
  const absDiff = createMemo(() => Math.abs(diff()));

  if (typeof updateInterval === "number") setInterval(updateInterval);
  else createEffect(on(absDiff, diff => setInterval(updateInterval(diff))));

  const timeAgo = createMemo(() => {
    if (absDiff() < min) return messages.justNow;

    if (absDiff() > max) return absoluteFormatter(target());

    if (relativeFormatter) return relativeFormatter(target(), now(), diff());

    for (const unit of UNITS) {
      if (absDiff() < unit.max) return format(unit);
    }
    return messages.justNow;
  });

  function applyFormat(name: keyof DateDifferenceMessages, val: number | string, isPast: boolean) {
    const formatter = messages[name];
    if (typeof formatter === "function") return formatter(val as never, isPast);
    return formatter.replace("{0}", val.toString());
  }

  function format(unit: Unit) {
    const val = Math.round(absDiff() / unit.value);
    const past = diff() < 0;

    const str = applyFormat(unit.name, val, past);
    return applyFormat(past ? "past" : "future", str, past);
  }

  return [
    timeAgo,
    {
      target,
      now,
      update
    }
  ];
}
