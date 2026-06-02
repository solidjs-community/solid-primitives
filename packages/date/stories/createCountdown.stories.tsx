import { createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createCountdown, createCountdownFromNow } from "@solid-primitives/date";
import { toDatetimeLocal } from "./_helpers.js";
import { Stat, Button, Container } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Utilities/Date",
  parameters: { layout: "centered" },
});

export default meta;

const CountdownDisplay = (props: { days?: number; hours?: number; minutes?: number; seconds?: number }) => (
  <div style={{ display: "flex", gap: "1rem" }}>
    {(
      [
        ["days", props.days],
        ["hours", props.hours],
        ["minutes", props.minutes],
        ["seconds", props.seconds],
      ] as const
    ).map(([label, value]) => (
      <div style={{ "text-align": "center" }}>
        <div style={{ "font-size": "2rem", "font-weight": "bold", "font-variant-numeric": "tabular-nums", "min-width": "2.5ch" }}>
          {String(value ?? 0).padStart(2, "0")}
        </div>
        <div style={{ "font-size": "0.75rem", color: "#64748b", "text-transform": "uppercase" }}>{label}</div>
      </div>
    ))}
  </div>
);

export const Countdown = meta.story({
  name: "Countdown breakdown",
  parameters: {
    docs: {
      description: {
        story:
          "`createCountdown` breaks a time difference into a reactive store of `{ days, hours, minutes, seconds, milliseconds }`. Pass two dates, or an existing difference accessor.",
      },
    },
  },
  render: () => {
    const [from, setFrom] = createSignal(new Date());
    const [to, setTo] = createSignal(new Date(Date.now() + 3_600_000));
    const countdown = createCountdown(from, to);

    return (
      <Container minWidth={340}>
        <h3 style={{ margin: 0 }}>createCountdown</h3>

        <div style={{ display: "flex", gap: "1rem", "flex-wrap": "wrap" }}>
          <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem", "font-size": "0.85rem" }}>
            From
            <input
              type="datetime-local"
              value={toDatetimeLocal(from())}
              onInput={e => setFrom(new Date(e.currentTarget.value))}
            />
          </label>
          <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem", "font-size": "0.85rem" }}>
            To
            <input
              type="datetime-local"
              value={toDatetimeLocal(to())}
              onInput={e => setTo(new Date(e.currentTarget.value))}
            />
          </label>
        </div>

        <CountdownDisplay
          days={countdown.days}
          hours={countdown.hours}
          minutes={countdown.minutes}
          seconds={countdown.seconds}
        />

        <div>
          <Stat label="Milliseconds">{countdown.milliseconds ?? 0}</Stat>
        </div>
      </Container>
    );
  },
});

export const CountdownFromNow = meta.story({
  name: "Live countdown",
  parameters: {
    docs: {
      description: {
        story:
          "`createCountdownFromNow` auto-updates the countdown on every tick (default: 1 second). Combine with a reactive target to build a live event timer.",
      },
    },
  },
  render: () => {
    const PRESETS = [
      { label: "1 min", ms: 60_000 },
      { label: "1 hr", ms: 3_600_000 },
      { label: "1 day", ms: 86_400_000 },
    ];

    const [target, setTarget] = createSignal(new Date(Date.now() + 60_000));
    const [countdown, { now, update }] = createCountdownFromNow(target, 1000);

    return (
      <Container minWidth={340}>
        <h3 style={{ margin: 0 }}>createCountdownFromNow</h3>

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center", "flex-wrap": "wrap" }}>
          {PRESETS.map(p => (
            <Button
              onClick={() => setTarget(new Date(Date.now() + p.ms))}
              variant="outline"
            >
              {p.label}
            </Button>
          ))}
          <input
            type="datetime-local"
            value={toDatetimeLocal(target())}
            onInput={e => setTarget(new Date(e.currentTarget.value))}
            style={{ "font-size": "0.85rem" }}
          />
        </div>

        <CountdownDisplay
          days={countdown.days}
          hours={countdown.hours}
          minutes={countdown.minutes}
          seconds={countdown.seconds}
        />

        <div>
          <Stat label="Now">{now().toLocaleTimeString()}</Stat>
          <Stat label="Target">{target().toLocaleString()}</Stat>
        </div>

        <Button onClick={update} variant="outline" style={{ "align-self": "flex-start" }}>
          Force update
        </Button>
      </Container>
    );
  },
});
