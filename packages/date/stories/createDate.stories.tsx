import { createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createDate, createDateNow } from "@solid-primitives/date";
import readme from "../README.md?raw";
import { toDatetimeLocal } from "./_helpers.js";
import { Stat, Button, Container } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Utilities/Date",
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

export const CreateDate = meta.story({
  name: "Reactive date signal",
  parameters: {
    docs: {
      description: {
        story:
          "`createDate` wraps a date value in a reactive signal. The setter accepts a `Date`, timestamp, or date string — and also an updater function `prev => newDate`.",
      },
    },
  },
  render: () => {
    const [date, setDate] = createDate(new Date());

    return (
      <Container minWidth={340}>
        <h3 style={{ margin: 0 }}>createDate</h3>

        <div>
          <Stat label="Date">{date().toLocaleDateString()}</Stat>
          <Stat label="Time">{date().toLocaleTimeString()}</Stat>
          <Stat label="Timestamp">{date().getTime()}</Stat>
        </div>

        <input
          type="datetime-local"
          value={toDatetimeLocal(date())}
          onInput={e => setDate(new Date(e.currentTarget.value))}
        />

        <div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
          <Button onClick={() => setDate(new Date())} variant="outline">Now</Button>
          <Button onClick={() => setDate(Date.now() - 86_400_000)} variant="outline">Yesterday</Button>
          <Button onClick={() => setDate(Date.now() - 7 * 86_400_000)} variant="outline">Last week</Button>
          <Button onClick={() => setDate(Date.now() + 86_400_000)} variant="outline">Tomorrow</Button>
        </div>
      </Container>
    );
  },
});

export const CreateDateNow = meta.story({
  name: "Auto-updating date",
  parameters: {
    docs: {
      description: {
        story:
          "`createDateNow` returns an auto-updating `Date` signal. Pass an interval in ms, a reactive signal, or `() => false` to disable auto-updates and rely on the manual trigger instead.",
      },
    },
  },
  render: () => {
    const [interval, setInterval] = createSignal<number | false>(1000);
    const [now, update] = createDateNow(interval);

    return (
      <Container minWidth={340}>
        <h3 style={{ margin: 0 }}>createDateNow</h3>

        <div>
          <Stat label="Date">{now().toLocaleDateString()}</Stat>
          <Stat label="Time">{now().toLocaleTimeString()}</Stat>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <span style={{ "font-size": "0.85rem", color: "#64748b" }}>Interval:</span>
          {([250, 1000, 5000] as const).map(ms => (
            <Button
              onClick={() => setInterval(ms)}
              variant={interval() === ms ? "primary" : "outline"}
            >
              {ms}ms
            </Button>
          ))}
          <Button
            onClick={() => setInterval(false)}
            variant={interval() === false ? "primary" : "outline"}
          >
            off
          </Button>
        </div>

        <Button onClick={update} variant="outline" style={{ "align-self": "flex-start" }}>
          Force update
        </Button>
      </Container>
    );
  },
});
