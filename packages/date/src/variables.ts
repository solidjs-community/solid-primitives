import type { RelativeFormatMessages, Unit } from "./types.js";

/** one second in ms */
export const SECOND = 1000,
  /** one minute in ms */
  MINUTE = 60_000,
  /** one hour in ms */
  HOUR = 3_600_000,
  /** one day in ms */
  DAY = 86_400_000,
  /** one week in ms */
  WEEK = 604_800_000,
  /** one month in ms */
  MONTH = 2_592_000_000,
  /** one year in ms */
  YEAR = 31_536_000_000;

/** @internal */
export const UNITS: Unit[] = [
  { max: 60000, value: SECOND, name: "second" },
  { max: 2760000, value: MINUTE, name: "minute" },
  { max: 72000000, value: HOUR, name: "hour" },
  { max: 518400000, value: DAY, name: "day" },
  { max: 2419200000, value: WEEK, name: "week" },
  { max: 28512000000, value: MONTH, name: "month" },
  { max: Infinity, value: YEAR, name: "year" },
];

/** @internal */
export const DEFAULT_MESSAGES: RelativeFormatMessages = {
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
  second: n => `${n} second${n > 1 ? "s" : ""}`,
};
