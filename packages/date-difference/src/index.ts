import { Accessor, createEffect, createMemo, createSignal } from "solid-js";
import { access, Fn, MaybeAccessor } from "./common";

export type MessageFormatter<T = number> = (value: T, isPast: boolean) => string;

export interface TimeAgoMessages {
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
  name: keyof TimeAgoMessages;
}

const UNITS: Unit[] = [
  { max: 60000, value: 1000, name: "second" },
  { max: 2760000, value: 60000, name: "minute" },
  { max: 72000000, value: 3600000, name: "hour" },
  { max: 518400000, value: 86400000, name: "day" },
  { max: 2419200000, value: 604800000, name: "week" },
  { max: 28512000000, value: 2592000000, name: "month" },
  { max: Infinity, value: 31536000000, name: "year" }
];

const DEFAULT_MESSAGES: TimeAgoMessages = {
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

export function createDateNow(
  updateInterval: MaybeAccessor<number> = 30_000
): [Accessor<Date>, { time: Accessor<number>; update: Fn }] {
  const [nowDate, setNowDate] = createSignal(new Date());
  const update = () => setNowDate(new Date());
  let interval: NodeJS.Timer;
  createEffect(() => {
    clearInterval(interval);
    interval = setInterval(update, access(updateInterval));
  });
  return [
    nowDate,
    {
      time: createMemo(() => nowDate().getTime()),
      update
    }
  ];
}

export default function createDateDifference(date: MaybeAccessor<number | Date | string>): [
  Accessor<string>,
  {
    date: Accessor<Date>;
    time: Accessor<number>;
    nowDate: Accessor<Date>;
    nowTime: Accessor<number>;
  }
] {
  const targetDate = createMemo(() => new Date(access(date)));
  const [nowDate, { time: nowTime, update }] = createDateNow();

  return [
    () => "nothing yet",
    {
      date: targetDate,
      time: createMemo(() => targetDate().getTime()),
      nowDate,
      nowTime
    }
  ];
}
