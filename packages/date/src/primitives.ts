import { access, Fn, isFunction, isDefined, MaybeAccessor } from "@solid-primitives/utils";
import {
  Accessor,
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  onCleanup
} from "solid-js";
import { createStore, Store } from "solid-js/store";
import {
  Countdown,
  DateInit,
  DateSetter,
  DEFAULT_MESSAGES,
  formatDate,
  formatTimeDifference,
  TimeAgoOptions,
  getCountdown,
  getDate,
  getDateDifference,
  getTime,
  GetUpdateInterval,
  HOUR,
  MINUTE,
  TimeSetter,
  UpdateInterval
} from ".";

export const createDate = (init: MaybeAccessor<DateInit>): [Accessor<Date>, DateSetter] => {
  const [date, setDate] = createSignal(getDate(access(init)));
  const setter: DateSetter = input =>
    setDate(prev => {
      const init = isFunction(input) ? input(prev) : input;
      return getDate(init);
    });
  if (isFunction(init)) createComputed(() => setter(init()));
  return [date, setter];
};

export const createTime = (init: MaybeAccessor<DateInit>): [Accessor<number>, TimeSetter] => {
  const [time, setTime] = createSignal(getTime(access(init)));
  const setter: TimeSetter = input =>
    setTime(prev => {
      const init = isFunction(input) ? input(prev) : input;
      return getTime(init);
    });
  if (isFunction(init)) createComputed(() => setter(init()));
  return [time, setter];
};

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
export function createDateNow(
  interval: MaybeAccessor<UpdateInterval> = MINUTE / 2
): [Accessor<Date>, Fn] {
  const [now, setNow] = createSignal(new Date());
  const update = () => setNow(new Date());
  let timer: number;
  createEffect(() => {
    clearInterval(timer);
    const ms = access(interval);
    // if interval === 0 the date won't update automatically
    if (ms) timer = setInterval(update, ms);
  });
  onCleanup(() => clearInterval(timer));
  return [now, update];
}

export function createTimeDifference(
  from: MaybeAccessor<DateInit>,
  to: MaybeAccessor<DateInit>
): [difference: Accessor<number>, extra: { from: Accessor<Date>; to: Accessor<Date> }] {
  const [fromDate] = createDate(from),
    [toDate] = createDate(to);
  const diff = createMemo(() => getDateDifference(fromDate(), toDate()));
  return [diff, { from: fromDate, to: toDate }];
}

export function createTimeDifferenceFromNow(
  to: MaybeAccessor<DateInit>,
  updateInterval: UpdateInterval | GetUpdateInterval = diff =>
    Math.abs(diff) <= HOUR ? MINUTE / 2 : HOUR / 2
): [difference: Accessor<number>, extra: { from: Accessor<Date>; to: Accessor<Date>; update: Fn }] {
  const [now, update] = createDateNow(
    isFunction(updateInterval) ? () => updateInterval(diff()) : updateInterval
  );
  const [diff, extra] = createTimeDifference(now, to);
  return [diff, { update, ...extra }];
}

export function createTimeAgo(
  to: MaybeAccessor<DateInit>,
  options: TimeAgoOptions = {}
): [
  timeago: Accessor<string>,
  extra: { from: Accessor<Date>; to: Accessor<Date>; update: Fn; difference: Accessor<number> }
] {
  const {
    min = MINUTE,
    max = Infinity,
    dateFormatter = formatDate,
    messages,
    differenceFormatter = (a, b, diff) => formatTimeDifference(diff, messages)
  } = options;

  const [difference, extra] = createTimeDifferenceFromNow(to, options.interval);

  const timeAgo = createMemo(() => {
    const absDiff = Math.abs(difference());
    if (absDiff < min) return messages?.justNow ?? DEFAULT_MESSAGES.justNow;
    if (absDiff > max) return dateFormatter(extra.to());
    return differenceFormatter(extra.from(), extra.to(), difference());
  });

  return [timeAgo, { ...extra, difference }];
}

export function createCountdown(
  from: MaybeAccessor<DateInit>,
  to: MaybeAccessor<DateInit>
): Store<Countdown>;
export function createCountdown(difference: Accessor<number>): Store<Countdown>;
export function createCountdown(
  a: MaybeAccessor<DateInit> | Accessor<number>,
  b?: MaybeAccessor<DateInit>
): Store<Countdown> {
  let difference: Accessor<number>;
  if (isDefined(b)) difference = createTimeDifference(a, b)[0];
  else difference = a as Accessor<number>;
  const [countdown, setCountdown] = createStore<Countdown>({});
  createComputed(() => setCountdown(getCountdown(difference())));
  return countdown;
}

export function createCountdownFromNow(
  to: MaybeAccessor<DateInit>,
  updateInterval: UpdateInterval | GetUpdateInterval = 1000
): [countdown: Store<Countdown>, extra: { from: Accessor<Date>; to: Accessor<Date>; update: Fn }] {
  const [difference, extra] = createTimeDifferenceFromNow(to, updateInterval);
  const countdown = createCountdown(difference);
  return [countdown, extra];
}
