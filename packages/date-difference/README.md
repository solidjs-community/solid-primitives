---
Name: date-difference
Stage: 2
Package: "@solid-primitives/date-difference"
Primitives: createDateNow, createDateDifference
Category: Utilities
---

# @solid-primitives/date-difference

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/date-difference?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/date-difference)
[![size](https://img.shields.io/npm/v/@solid-primitives/date-difference?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/date-difference)

Two reactive primitives that provide autoupdating, relative date features.

- [`createDateNow`](#createdatenow) - Creates an autoupdating and reactive `new Date()`
- [`createDateDifference`](#createdatedifference) - Provides a reactive, formatted date difference in relation to now.

## `createDateNow`

Creates an autoupdating and reactive `new Date()`

### Usage

```ts
import { createDateNow } from "@solid-primitives/date-difference";

// updates every second:
const [now] = createDateNow(1000);

// won't autoupdate:
const [now, update] = createDateNow(0);

// update manually:
update();
```

### Types

```ts
function createDateNow(interval?: MaybeAccessor<number>): [Accessor<Date>, Function];
```

## `createDateDifference`

Provides a reactive, formatted date difference in relation to now.

### Usage

```ts
import { createDateDifference } from "@solid-primitives/date-difference";

const [myDate, setMyDate] = createSignal(new Date("Jun 28, 2021"));
const [timeago, { target, now, update }] = createDateDifference(myDate);
// => 5 months ago

// use custom libraries to change formatting:
import { formatRelative } from "date-fns";
const [timeago] = createDateDifference(1577836800000, {
  min: 10000,
  updateInterval: 30000,
  relativeFormatter: (target, now) => formatRelative(target, now)
});
// => last Monday at 9:25 AM
```

### Types

```ts
function createDateDifference(
  date: MaybeAccessor<number | Date | string>,
  options?: DateDifferenceOptions
): [
  Accessor<string>,
  {
    target: Accessor<Date>;
    now: Accessor<Date>;
    update: Function;
  }
];

interface DateDifferenceOptions {
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

type MessageFormatter<T = number> = (value: T, isPast: boolean) => string;

type RelativeFormatter = (
  target: Date,
  now: Date,
  diff: number,
  messages: DateDifferenceMessages
) => string;

interface DateDifferenceMessages {
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
```

## Demo

https://codesandbox.io/s/solid-date-difference-hjxui?file=/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-0 primitive.

1.0.0

Stage-2 realease.

</details>

## Acknowledgement

- [VueUse — useTimeAgo](https://vueuse.org/core/usetimeago/)
