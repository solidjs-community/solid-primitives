---
"@solid-primitives/temporal": patch
---

Initial release of `@solid-primitives/temporal`

Reactive primitives for the Temporal API, alongside the `Date`-based `@solid-primitives/date`.
Expects a global `Temporal` (native, or `temporal-polyfill/global`).

- `createTemporal` — a signal of any Temporal value, compared with `.equals()` instead of `===`.
- `createInstantNow` / `createZonedDateTimeNow` — auto-updating **now**, the latter in a reactive
  time zone.
- `createToday` — today's `PlainDate`, updated by a single timer set for the zone's next start of
  day, correct across daylight saving changes.
- `createDuration` — a reactive, calendar-aware `Temporal.Duration` that only notifies when its
  length (or its options) change.
- `createRelativeTime` / `formatRelativeTime` — localized relative time via
  `Intl.RelativeTimeFormat`, with days counted by the calendar.
- `temporalEquals` / `durationEquals` — value equality helpers for signals and memos.

Every primitive creates the same reactive nodes on the server and the client, so server-rendered
output hydrates without hydration-id mismatches.
