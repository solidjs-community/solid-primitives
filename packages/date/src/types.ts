import { type TimeoutSource } from "@solid-primitives/timer";

export type MessageFormatter<T = number> = (value: T, isPast: boolean) => string;
export type RelativeFormatter = (now: Date, target: Date, diff: number) => string;

export interface RelativeFormatMessages {
  justNow: string;
  past: string | MessageFormatter<string>;
  future: string | MessageFormatter<string>;
  year: string | MessageFormatter;
  month: string | MessageFormatter;
  day: string | MessageFormatter;
  week: string | MessageFormatter;
  hour: string | MessageFormatter;
  minute: string | MessageFormatter;
  second: string | MessageFormatter;
}

export interface Unit {
  max: number;
  value: number;
  name: keyof RelativeFormatMessages;
}

export interface Countdown {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

export interface TimeAgoOptions {
  /**
   * Intervals to update, set 0 to disable auto update
   *
   * @default (diff) => diff <= 3600_000 ? 30_000 : 1800_000
   */
  interval?: TimeoutSource | GetUpdateInterval;

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
  messages?: Partial<RelativeFormatMessages>;

  /**
   * Formatter for full date
   */
  dateFormatter?: (date: Date) => string;

  /**
   * Relative time formatter
   */
  relativeFormatter?: RelativeFormatter;
}

/** timestamp `number` | date `string` | `Date` instance */
export type DateInit = number | Date | string;
export type DateSetter = (input: DateInit | ((prev: Date) => DateInit)) => Date;
export type TimeSetter = (input: DateInit | ((prev: number) => DateInit)) => number;
export type GetUpdateInterval = (difference: number) => number | false;
