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

interface DateDifferenceOptions {
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
   * @default undefined
   */
  max?: number;

  /**
   * Messages for formating the string
   */
  messages?: DateDifferenceMessages;

  /**
   * Formatter for full date
   */
  fullDateFormatter?: (date: Date) => string;

  /**
   * Relative time formatter
   */
  relativeFormatter?: (target: Date, now: Date, diff: number) => string;
}

const SECOND = 1000,
  MINUTE = 60000,
  HOUR = 3600000,
  DAY = 86400000,
  WEEK = 604800000,
  MONTH = 2592000000,
  YEAR = 31536000000;

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

export function createDateNow(
  interval: MaybeAccessor<number> = MINUTE / 2
): [Accessor<Date>, { time: Accessor<number>; update: Fn }] {
  const [nowDate, setNowDate] = createSignal(new Date());
  const update = () => setNowDate(new Date());
  let timer: NodeJS.Timer;
  createEffect(() => {
    clearInterval(timer);
    const _interval = access(interval);
    if (_interval) timer = setInterval(update, _interval);
  });
  onCleanup(() => clearInterval(timer));
  return [
    nowDate,
    {
      time: createMemo(() => nowDate().getTime()),
      update
    }
  ];
}

export default function createDateDifference(
  date: MaybeAccessor<number | Date | string>,
  options: DateDifferenceOptions = {}
): [
  Accessor<string>,
  {
    targetDate: Accessor<Date>;
    targetTime: Accessor<number>;
    nowDate: Accessor<Date>;
    nowTime: Accessor<number>;
    update: Fn;
  }
] {
  const { abs, round } = Math;
  const {
    min = MINUTE,
    messages = DEFAULT_MESSAGES,
    max = Infinity,
    updateInterval = DEFAULT_UPDATE_INTERVAL,
    fullDateFormatter = DEFAULT_FORMATTER,
    relativeFormatter
  } = options;

  const targetDate = createMemo(() => new Date(access(date)));
  const targetTime = createMemo(() => targetDate().getTime());
  const [interval, setInterval] = createSignal(0);
  const [nowDate, { time: nowTime, update }] = createDateNow(interval);
  const diff = createMemo(on([targetTime, nowTime], ([target, now]) => target - now));
  const absDiff = createMemo(() => abs(diff()));

  if (typeof updateInterval === "number") setInterval(updateInterval);
  else createEffect(on(absDiff, diff => setInterval(updateInterval(diff))));

  const timeAgo = createMemo(() => {
    if (absDiff() < min) return messages.justNow;

    if (absDiff() > max) return fullDateFormatter(targetDate());

    if (relativeFormatter) return relativeFormatter(targetDate(), nowDate(), diff());

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
    const val = round(absDiff() / unit.value);
    const past = diff() < 0;

    const str = applyFormat(unit.name, val, past);
    return applyFormat(past ? "past" : "future", str, past);
  }

  return [
    timeAgo,
    {
      targetDate,
      targetTime,
      nowDate,
      nowTime,
      update
    }
  ];
}
