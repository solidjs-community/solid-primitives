<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=temporal&version=2.0" alt="Solid Primitives temporal">
</p>

# @solid-primitives/temporal

[![size](https://img.shields.io/badge/size-1.54_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/temporal)
[![version](https://img.shields.io/npm/v/@solid-primitives/temporal?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/temporal)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Reactive primitives for the [Temporal API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal) — the time zone and calendar-aware successor to `Date`. For `Date`-based primitives, see [`@solid-primitives/date`](https://github.com/solidjs-community/solid-primitives/tree/main/packages/date).

- [`createTemporal`](#createtemporal) - A signal holding a Temporal value, compared by value instead of by reference.
- [`createInstantNow`](#createinstantnow) - An auto-updating `Temporal.Instant` of **now**.
- [`createZonedDateTimeNow`](#createzoneddatetimenow) - An auto-updating `Temporal.ZonedDateTime` of **now** in a reactive time zone.
- [`createToday`](#createtoday) - Today's `Temporal.PlainDate`, updated exactly when the day changes.
- [`createDuration`](#createduration) - A reactive, calendar-aware `Temporal.Duration` between two values.
- [`createRelativeTime`](#createrelativetime) - An auto-updating, localized relative time string such as _"5 minutes ago"_.
- \+ [utility functions](#utility-functions): `formatRelativeTime`, `temporalEquals`, `durationEquals`.

## Installation

```bash
npm install @solid-primitives/temporal
# or
yarn add @solid-primitives/temporal
# or
pnpm add @solid-primitives/temporal
```

### Temporal support

This package uses the global `Temporal` object and doesn't bundle a polyfill. Where Temporal
isn't available natively, install one once at your app's entry point, before anything that
uses this package:

```bash
npm install temporal-polyfill
```

```ts
// entry-client.tsx / entry-server.tsx
import "temporal-polyfill/global";
```

`temporal-polyfill/global` only installs itself when `globalThis.Temporal` is missing.

TypeScript 6+ includes the Temporal types in `lib: ["ESNext"]`. On older versions, add
`"types": ["temporal-polyfill/global"]` to your `tsconfig.json`.

### Clock

"Now" is read from `Date.now()` — millisecond precision, on the same clock as the timers that
update it. That also means fake timers such as `vi.useFakeTimers()` control it in tests, which
they don't do for the native `Temporal.Now`.

### Server rendering

On the server, values are computed once at render time and never update; no timers are
scheduled. The server's time zone is usually not the visitor's, so pass an explicit `timeZone`
to anything that depends on it if the rendered text must match on hydration.

## `createTemporal`

Creates a signal holding a Temporal value. Temporal objects are immutable, so every change is a
new object: the signal compares values with [`temporalEquals`](#temporalequals) rather than
`===`, and setting an equal value doesn't notify.

```ts
const [date, setDate] = createTemporal(Temporal.PlainDate.from("2026-01-31"));

date(); // T: Temporal.PlainDate

setDate(d => d.add({ months: 1 })); // 2026-02-28 — month arithmetic clamps to the month's end
setDate(Temporal.PlainDate.from("2026-02-28")); // same value: no update

// the initial value can be reactive; the signal resets whenever it changes
const [source, setSource] = createSignal(Temporal.PlainTime.from("09:00"));
const [time, setTime] = createTemporal(source);
```

## `createInstantNow`

Creates an auto-updating `Temporal.Instant` of **now**.

```ts
// updates every second
const [now] = createInstantNow(1000);

now(); // T: Temporal.Instant

// the interval can be reactive; `false` or `0` stops auto-updating
const [interval, setInterval] = createSignal<number | false>(1000);
const [now, update] = createInstantNow(interval);

// update manually
update();
```

### Definition

```ts
function createInstantNow(
  interval?: TimeoutSource, // default: 30 seconds
): [now: Accessor<Temporal.Instant>, update: VoidFunction];
```

## `createZonedDateTimeNow`

Creates an auto-updating `Temporal.ZonedDateTime` of **now**. The time zone can be reactive, and
changing it updates `now` immediately.

```tsx repl
import "temporal-polyfill/global";
import { render } from "@solidjs/web";
import { createSignal, For } from "solid-js";
import { createZonedDateTimeNow } from "@solid-primitives/temporal";

const ZONES = ["UTC", "America/New_York", "Europe/Warsaw", "Asia/Tokyo"];

function Demo() {
  const [zone, setZone] = createSignal("UTC");
  const [now] = createZonedDateTimeNow(zone, 1000);
  return (
    <>
      <select onChange={e => setZone(e.currentTarget.value)}>
        <For each={ZONES}>{z => <option>{z}</option>}</For>
      </select>
      <p>{now().toPlainTime().round("seconds").toString()}</p>
      <p>offset: {now().offset}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### Definition

```ts
function createZonedDateTimeNow(
  timeZone?: MaybeAccessor<string>, // default: the runtime's time zone
  interval?: TimeoutSource, // default: 30 seconds
): [now: Accessor<Temporal.ZonedDateTime>, update: VoidFunction];
```

## `createToday`

Creates an auto-updating `Temporal.PlainDate` of today in a time zone. Rather than polling, it
sets a single timer for the moment the next day starts there. Temporal works out that moment
correctly across daylight saving changes and in zones where a day starts at 01:00 instead of
midnight.

```ts
const today = createToday();
today(); // T: Temporal.PlainDate

// in a specific, possibly reactive, time zone
const [zone, setZone] = createSignal("America/New_York");
const today = createToday(zone);

// e.g. show which dates are in the past
const isPast = (date: Temporal.PlainDate) => Temporal.PlainDate.compare(date, today()) < 0;
```

### Definition

```ts
function createToday(
  timeZone?: MaybeAccessor<string>, // default: the runtime's time zone
): Accessor<Temporal.PlainDate>;
```

## `createDuration`

Creates a reactive `Temporal.Duration` from `from` to `to` (`from.until(to, options)`). Both
values must be of the same Temporal type.

Unlike millisecond arithmetic it is calendar-aware: from January 31 to March 31 is two months,
and a day across a daylight saving change is still one day for `ZonedDateTime`.

The duration only notifies when its _length_ changes — compared with
[`durationEquals`](#durationequals), relative to `from` — or when `options` change.

```ts
const [checkIn, setCheckIn] = createSignal(Temporal.PlainDate.from("2026-07-01"));
const [checkOut, setCheckOut] = createSignal(Temporal.PlainDate.from("2026-07-08"));

const stay = createDuration(checkIn, checkOut);
stay().days; // 7

const today = createToday();
const age = createDuration(Temporal.PlainDate.from("1990-05-17"), today, { largestUnit: "years" });
age().years;
```

A countdown is `createDuration` from **now**:

```tsx repl
import "temporal-polyfill/global";
import { render } from "@solidjs/web";
import { createDuration, createZonedDateTimeNow } from "@solid-primitives/temporal";

function Demo() {
  const [now] = createZonedDateTimeNow(undefined, 1000);
  const newYear = now().toPlainDate().with({ month: 1, day: 1 }).add({ years: 1 });
  const remaining = createDuration(now, newYear.toZonedDateTime(now().timeZoneId), {
    largestUnit: "days",
    smallestUnit: "seconds",
  });
  return (
    <p>
      {remaining().days}d {remaining().hours}h {remaining().minutes}m {remaining().seconds}s until{" "}
      {newYear.year}
    </p>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### Definition

```ts
function createDuration<T extends DiffableTemporal>(
  from: MaybeAccessor<T>,
  to: MaybeAccessor<T>,
  options?: MaybeAccessor<DifferenceOptions<T> | undefined>,
): Accessor<Temporal.Duration>;
```

## `createRelativeTime`

Creates an auto-updating, localized relative time string for a target `Temporal.Instant` or
`Temporal.ZonedDateTime`, using
[`Intl.RelativeTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat).
Every locale the runtime supports works, without any message tables.

The distance is rounded to its largest unit (_"1 hour 40 minutes"_ is _"in 2 hours"_), days are
counted by the calendar of `timeZone` (at noon, midnight the day before is _"yesterday"_), and
7 or more days are shown in weeks. `numeric` defaults to `"auto"`, so you get _"yesterday"_ and
_"next month"_ rather than _"1 day ago"_ and _"in 1 month"_.

```tsx repl
import "temporal-polyfill/global";
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createRelativeTime } from "@solid-primitives/temporal";

function Demo() {
  const [target, setTarget] = createSignal(Temporal.Now.instant().subtract({ minutes: 5 }));
  const [en] = createRelativeTime(target, { locale: "en" });
  const [es] = createRelativeTime(target, { locale: "es" });
  const [ja] = createRelativeTime(target, { locale: "ja", style: "short" });
  return (
    <>
      <p>{en()}</p>
      <p>{es()}</p>
      <p>{ja()}</p>
      <button onClick={() => setTarget(t => t.subtract({ hours: 6 }))}>-6 hours</button>
      <button onClick={() => setTarget(t => t.add({ hours: 6 }))}>+6 hours</button>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const [text, { now, difference, update }] = createRelativeTime(target, {
  locale: "en", // any Intl locale, default: the runtime's
  style: "long", // Intl.RelativeTimeFormat options
  numeric: "auto",
  threshold: { minutes: 1 }, // shorter distances render as `justNow`
  justNow: "just now", // default: the localized "now"
  timeZone: "Europe/Warsaw", // decides "yesterday", "last month"…; may be reactive
  // ms between updates of now; a number, a signal, or a function of the distance
  interval: (difference, now) => 60_000,
});

text(); // T: string
difference(); // T: Temporal.Duration, from now to the target
now(); // T: Temporal.ZonedDateTime
```

By default, **now** updates every 30 seconds while the target is within an hour, and every 30
minutes after that.

### Definition

```ts
function createRelativeTime(
  target: MaybeAccessor<Temporal.Instant | Temporal.ZonedDateTime>,
  options?: RelativeTimeOptions,
): [
  text: Accessor<string>,
  extra: {
    now: Accessor<Temporal.ZonedDateTime>;
    difference: Accessor<Temporal.Duration>;
    update: VoidFunction;
  },
];
```

## Utility functions

### `formatRelativeTime`

The non-reactive formatter behind `createRelativeTime`. `relativeTo` (usually **now**) is
required because months, years and days have no fixed length.

```ts
const now = Temporal.Now.zonedDateTimeISO();

formatRelativeTime(Temporal.Duration.from({ hours: -3 }), now); // "3 hours ago"
formatRelativeTime(Temporal.Duration.from({ days: 1 }), now); // "tomorrow"
formatRelativeTime(Temporal.Duration.from({ days: 20 }), now); // "in 3 weeks"
formatRelativeTime(Temporal.Duration.from({ days: -2 }), now, { locale: "es" }); // "anteayer"
```

### `temporalEquals`

Compares two Temporal values of the same type with `.equals()`, and durations with
`durationEquals`. Values of different Temporal types are never equal. Use it as the `equals`
option of your own signals and memos:

```ts
const date = createMemo(() => props.event.start.toPlainDate(), { equals: temporalEquals });
```

### `durationEquals`

Compares two durations by length rather than by shape, so `PT60M` equals `PT1H`. Years, months
and weeks have no fixed length, so durations using them are compared against `relativeTo`, or
field by field without it.

```ts
durationEquals(Temporal.Duration.from("PT60M"), Temporal.Duration.from("PT1H")); // true

const january = Temporal.PlainDate.from("2026-01-01");
durationEquals(Temporal.Duration.from("P1M"), Temporal.Duration.from("P31D"), january); // true
durationEquals(Temporal.Duration.from("P1M"), Temporal.Duration.from("P31D")); // false
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
