import { access, Fn, isAccessor, isDefined, MaybeAccessor } from "@solid-primitives/utils";
import {
  Accessor,
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  onCleanup
} from "solid-js";
import { createStore } from "solid-js/store";
import { Store } from "solid-js/store";
import { Countdown, getCountdown, MINUTE } from ".";

export type DateInit = number | Date | string;
export type DateSetter = (input: DateInit | ((prev: Date) => DateInit)) => Date;
export type TimeSetter = (input: DateInit | ((prev: number) => DateInit)) => number;

export const createDate = (init: MaybeAccessor<DateInit>): [Accessor<Date>, DateSetter] => {
  const [date, setDate] = createSignal(new Date(access(init)));
  const setter: DateSetter = input =>
    setDate(prev => {
      const init = typeof input === "function" ? input(prev) : input;
      return init instanceof Date ? init : new Date(init);
    });
  if (isAccessor(init)) createComputed(() => setter(init()));
  return [date, setter];
};

export const createTime = (input: MaybeAccessor<DateInit>): [Accessor<number>, TimeSetter] => {
  const [date, setDate] = createDate(input);
  const time = createMemo(() => date().getTime());
  const setter: TimeSetter = input => {
    const date = setDate(typeof input === "function" ? input(time()) : input);
    return date.getTime();
  };
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
export function createDateNow(interval: MaybeAccessor<number> = MINUTE / 2): [Accessor<Date>, Fn] {
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

export function createDateDifference(
  from: MaybeAccessor<DateInit>,
  to: MaybeAccessor<DateInit>
): Accessor<number> {
  const [fromTime] = createTime(from),
    [toTime] = createTime(to);
  return createMemo(() => fromTime() - toTime());
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
  if (isDefined(b)) difference = createDateDifference(a, b);
  else difference = a as Accessor<number>;
  const [countdown, setCountdown] = createStore<Countdown>({});
  createComputed(() => setCountdown(getCountdown(difference())));
  return countdown;
}
