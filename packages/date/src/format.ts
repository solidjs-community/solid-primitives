import {
  Countdown,
  DateInit,
  DAY,
  DEFAULT_MESSAGES,
  HOUR,
  MINUTE,
  RelativeFormatMessages,
  SECOND,
  Unit,
  UNITS
} from ".";

export const getDate = (init: DateInit): Date => (init instanceof Date ? init : new Date(init));
export const getTime = (init: DateInit): number =>
  typeof init === "number"
    ? init
    : init instanceof Date
    ? init.getTime()
    : new Date(init).getTime();

export const getDateDifference = (from: Date, to: Date): number => to.getTime() - from.getTime();

export const getCountdown = (difference: number): Countdown => ({
  days: Math.floor(difference / DAY),
  hours: Math.floor(difference / HOUR),
  minutes: Math.floor(difference / MINUTE),
  seconds: Math.floor(difference / SECOND),
  milliseconds: difference
});

export const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

export function formatTimeDifference(
  difference: number,
  messages?: Partial<RelativeFormatMessages>
): string {
  const _messages: RelativeFormatMessages = {
    ...DEFAULT_MESSAGES,
    ...messages
  };
  const absDiff = Math.abs(difference);

  for (const unit of UNITS) {
    if (absDiff < unit.max) return format(unit);
  }
  return _messages.justNow;

  function applyFormat(name: keyof RelativeFormatMessages, val: number | string, isPast: boolean) {
    const formatter = _messages[name];
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
