import "temporal-polyfill/global";
import { createSignal, For } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createDuration,
  createRelativeTime,
  createToday,
  createZonedDateTimeNow,
} from "@solid-primitives/temporal";
import readme from "../README.md?raw";
import { Stat, Button, ButtonRow, Container } from "../../../.storybook/ui/index.js";

const ZONES = ["UTC", "America/New_York", "Europe/Warsaw", "Asia/Tokyo", "Pacific/Kiritimati"];

const meta = preview.meta({
  title: "Utilities/Temporal",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: readme,
      },
    },
  },
});

export default meta;

export const ZonedNow = meta.story({
  name: "createZonedDateTimeNow & createToday — reactive time zone",
  parameters: {
    docs: {
      description: {
        story:
          "`createZonedDateTimeNow` and `createToday` take a reactive time zone. Switching it updates both immediately; `createToday` then schedules its next update for midnight in the new zone.",
      },
    },
  },
  render: () => {
    const [zone, setZone] = createSignal("UTC");
    const [now] = createZonedDateTimeNow(zone, 1000);
    const today = createToday(zone);

    return (
      <Container minWidth={340}>
        <h3 style={{ margin: 0 }}>createZonedDateTimeNow</h3>
        <ButtonRow>
          <For each={ZONES}>
            {z => (
              <Button onClick={() => setZone(z)} variant={zone() === z ? "primary" : "outline"}>
                {z}
              </Button>
            )}
          </For>
        </ButtonRow>
        <div>
          <Stat label="Time">{now().toPlainTime().round("seconds").toString()}</Stat>
          <Stat label="Offset">{now().offset}</Stat>
          <Stat label="Today">{today().toString()}</Stat>
          <Stat label="Day length">{now().hoursInDay}h</Stat>
        </div>
      </Container>
    );
  },
});

const PARTS = [
  ["months", "mo"],
  ["days", "d"],
  ["hours", "h"],
  ["minutes", "m"],
  ["seconds", "s"],
] as const;

const formatParts = (d: Temporal.Duration) =>
  PARTS.filter(([unit]) => d[unit] !== 0)
    .map(([unit, suffix]) => `${d[unit]}${suffix}`)
    .join(" ");

export const Countdown = meta.story({
  name: "createDuration — countdown",
  parameters: {
    docs: {
      description: {
        story:
          "`createDuration` from **now** to a target is a countdown. Units come from the `largestUnit`/`smallestUnit` options.",
      },
    },
  },
  render: () => {
    const [now] = createZonedDateTimeNow(undefined, 1000);
    const [largestUnit, setLargestUnit] = createSignal<"days" | "hours" | "months">("days");
    const target = now().toPlainDate().with({ month: 1, day: 1 }).add({ years: 1 });
    const remaining = createDuration(now, target.toZonedDateTime(now().timeZoneId), () => ({
      largestUnit: largestUnit(),
      smallestUnit: "seconds" as const,
    }));

    return (
      <Container minWidth={340}>
        <h3 style={{ margin: 0 }}>Until {target.toString()}</h3>
        <ButtonRow>
          <For each={["months", "days", "hours"] as const}>
            {unit => (
              <Button
                onClick={() => setLargestUnit(unit)}
                variant={largestUnit() === unit ? "primary" : "outline"}
              >
                {unit}
              </Button>
            )}
          </For>
        </ButtonRow>
        <div style={{ "font-size": "1.5rem", "font-weight": "bold", color: "#6366f1" }}>
          {formatParts(remaining())}
        </div>
        <Stat label="ISO 8601">{remaining().toString()}</Stat>
      </Container>
    );
  },
});

const OFFSETS = [
  { label: "-30 seconds", duration: { seconds: -30 } },
  { label: "-5 minutes", duration: { minutes: -5 } },
  { label: "-36 hours", duration: { hours: -36 } },
  { label: "-20 days", duration: { days: -20 } },
  { label: "-1 year", duration: { years: -1 } },
  { label: "+2 hours", duration: { hours: 2 } },
  { label: "+1 day", duration: { days: 1 } },
] satisfies { label: string; duration: Temporal.DurationLike }[];

export const RelativeTime = meta.story({
  name: "createRelativeTime — localized",
  parameters: {
    docs: {
      description: {
        story:
          "`createRelativeTime` formats with `Intl.RelativeTimeFormat`, so every locale works with no message tables. Days are counted by the calendar: from noon, 36 hours ago is *yesterday*.",
      },
    },
  },
  render: () => {
    const [target, setTarget] = createSignal(
      Temporal.Now.zonedDateTimeISO().subtract({ minutes: 5 }),
    );
    const [en] = createRelativeTime(target, { locale: "en", interval: 1000 });
    const [es] = createRelativeTime(target, { locale: "es", interval: 1000 });
    const [de] = createRelativeTime(target, { locale: "de", style: "short", interval: 1000 });
    const [ja] = createRelativeTime(target, { locale: "ja", interval: 1000 });

    return (
      <Container minWidth={340}>
        <h3 style={{ margin: 0 }}>createRelativeTime</h3>
        <ButtonRow>
          <For each={OFFSETS}>
            {o => (
              <Button
                onClick={() => setTarget(Temporal.Now.zonedDateTimeISO().add(o.duration))}
                variant="outline"
              >
                {o.label}
              </Button>
            )}
          </For>
        </ButtonRow>
        <div>
          <Stat label="en">{en()}</Stat>
          <Stat label="es">{es()}</Stat>
          <Stat label="de (short)">{de()}</Stat>
          <Stat label="ja">{ja()}</Stat>
          <Stat label="Target">{target().toPlainDateTime().round("minutes").toString()}</Stat>
        </div>
      </Container>
    );
  },
});
