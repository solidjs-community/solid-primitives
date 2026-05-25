import { createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createDate, createDateNow } from "@solid-primitives/date";
import readme from "../README.md?raw";
import { Stat, container, toDatetimeLocal } from "./_helpers.js";

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
      <div style={container}>
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
          <button onClick={() => setDate(new Date())}>Now</button>
          <button onClick={() => setDate(Date.now() - 86_400_000)}>Yesterday</button>
          <button onClick={() => setDate(Date.now() - 7 * 86_400_000)}>Last week</button>
          <button onClick={() => setDate(Date.now() + 86_400_000)}>Tomorrow</button>
        </div>
      </div>
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
      <div style={container}>
        <h3 style={{ margin: 0 }}>createDateNow</h3>

        <div>
          <Stat label="Date">{now().toLocaleDateString()}</Stat>
          <Stat label="Time">{now().toLocaleTimeString()}</Stat>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <span style={{ "font-size": "0.85rem", color: "#64748b" }}>Interval:</span>
          {([250, 1000, 5000] as const).map(ms => (
            <button
              onClick={() => setInterval(ms)}
              style={{ "font-weight": interval() === ms ? "bold" : "normal" }}
            >
              {ms}ms
            </button>
          ))}
          <button
            onClick={() => setInterval(false)}
            style={{ "font-weight": interval() === false ? "bold" : "normal" }}
          >
            off
          </button>
        </div>

        <button onClick={update} style={{ "align-self": "flex-start" }}>
          Force update
        </button>
      </div>
    );
  },
});
