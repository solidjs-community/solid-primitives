export type MessageFormatter<T = number> = (value: T, isPast: boolean) => string;
export type DifferenceFormatter = (from: Date, to: Date, diff: number) => string;

export interface RelativeFormatMessages {
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
  interval?: UpdateInterval | GetUpdateInterval;

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
  differenceFormatter?: DifferenceFormatter;
}

export type DateInit = number | Date | string;
export type DateSetter = (input: DateInit | ((prev: Date) => DateInit)) => Date;
export type TimeSetter = (input: DateInit | ((prev: number) => DateInit)) => number;
export type UpdateInterval = number | false;
export type GetUpdateInterval = (difference: number) => UpdateInterval;
