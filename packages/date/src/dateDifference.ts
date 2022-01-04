import { Accessor, createEffect, createMemo, createSignal, on } from "solid-js";
import { access, Fn, MaybeAccessor, onAccess } from "@solid-primitives/utils";
import { DAY, HOUR, MINUTE, MONTH, SECOND, WEEK, YEAR, createDateNow, getDateDifference } from ".";

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
  relativeFormatter?: RelativeFormatter;
}

export const createDate = (from: MaybeAccessor<number | Date | string>): Accessor<Date> =>
  createMemo(onAccess([from], ([from]) => (from instanceof Date ? from : new Date(from))));

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
  from: MaybeAccessor<number | Date | string>,
  to: MaybeAccessor<number | Date | string>
): [
  Accessor<number>,
  {
    from: Accessor<Date>;
    to: Accessor<Date>;
  }
] {
  const fromDate = createDate(from),
    toDate = createDate(to),
    diff = createMemo(() => getDateDifference(fromDate(), toDate()));
  return [diff, { from: fromDate, to: toDate }];

  /*
  const {
    min = MINUTE,
    max = Infinity,
    updateInterval = DEFAULT_UPDATE_INTERVAL,
    absoluteFormatter = DEFAULT_FORMATTER,
    relativeFormatter = DEFAULT_RELATIVE_FORMATTER
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
    return relativeFormatter(target(), now(), diff(), messages);
  });

  return [
    timeAgo,
    {
      target,
      now,
      update
    }
  ];
  */
}
