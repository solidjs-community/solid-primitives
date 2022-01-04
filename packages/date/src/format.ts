import { DAY, HOUR, MINUTE, MONTH, SECOND, WEEK, YEAR } from ".";

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

export interface Countdown {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

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

export const getDateDifference = (from: Date, to: Date): number => to.getTime() - from.getTime();

export function formatRelativeDate(
  difference: number,
  messages: DateDifferenceMessages = DEFAULT_MESSAGES
): string {
  const absDiff = Math.abs(difference);

  for (const unit of UNITS) {
    if (absDiff < unit.max) return format(unit);
  }
  return messages.justNow;

  function applyFormat(name: keyof DateDifferenceMessages, val: number | string, isPast: boolean) {
    const formatter = messages[name];
    if (typeof formatter === "function") return formatter(val as never, isPast);
    return formatter.replace("{0}", val.toString());
  }

  function format(unit: Unit) {
    const val = Math.round(absDiff / unit.value);
    const past = difference < 0;

    const str = applyFormat(unit.name, val, past);
    return applyFormat(past ? "past" : "future", str, past);
  }
}

export const getCountdown = (difference: number): Countdown => ({
  days: Math.floor(difference / (1000 * 60 * 60 * 24)),
  hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
  minutes: Math.floor((difference / 1000 / 60) % 60),
  seconds: Math.floor((difference / 1000) % 60),
  milliseconds: difference % 1000
});
