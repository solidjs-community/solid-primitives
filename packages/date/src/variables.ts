import { RelativeFormatMessages, Unit } from ".";

export const SECOND = 1000,
  MINUTE = 60_000,
  HOUR = 3_600_000,
  DAY = 86_400_000,
  WEEK = 604_800_000,
  MONTH = 2_592_000_000,
  YEAR = 31_536_000_000;

export const UNITS: Unit[] = [
  { max: 60000, value: SECOND, name: "second" },
  { max: 2760000, value: MINUTE, name: "minute" },
  { max: 72000000, value: HOUR, name: "hour" },
  { max: 518400000, value: DAY, name: "day" },
  { max: 2419200000, value: WEEK, name: "week" },
  { max: 28512000000, value: MONTH, name: "month" },
  { max: Infinity, value: YEAR, name: "year" }
];

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
  second: n => `${n} second${n > 1 ? "s" : ""}`
};
