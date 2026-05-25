import { createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createPolled, createIntervalCounter } from "@solid-primitives/timer";
import { Stat, container } from "./_helpers.js";

const meta = preview.meta({
  title: "Browser APIs/Timer",
  parameters: { layout: "centered" },
});

export default meta;

export const CreatePolled = meta.story({
  name: "Polling accessor",
  parameters: {
    docs: {
      description: {
        story:
          "`createPolled` executes a function on every tick and returns a reactive accessor to the latest value. The polling function receives its previous return value as `prev`, enabling accumulation patterns.",
      },
    },
  },
  render: () => {
    const [interval, setInterval] = createSignal<number | false>(1000);

    const timestamp = createPolled(() => Date.now(), interval);
    const history = createPolled(
      (prev: string[]) => {
        const t = new Date().toLocaleTimeString();
        return prev.length >= 5 ? [...prev.slice(1), t] : [...prev, t];
      },
      interval,
      [] as string[],
    );

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createPolled</h3>

        <Stat label="Timestamp">{timestamp()}</Stat>

        <div>
          <div style={{ color: "#64748b", "font-size": "0.85rem", "margin-bottom": "0.4rem" }}>
            Last 5 ticks
          </div>
          <div style={{ display: "flex", "flex-direction": "column", gap: "0.2rem" }}>
            {history().map((t, i) => (
              <code style={{ "font-size": "0.85rem", opacity: `${0.4 + i * 0.15}` }}>{t}</code>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center", "flex-wrap": "wrap" }}>
          <span style={{ "font-size": "0.85rem", color: "#64748b" }}>Interval:</span>
          {([250, 500, 1000, 2000] as const).map(ms => (
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
            Pause
          </button>
        </div>
      </div>
    );
  },
});

export const CreateIntervalCounter = meta.story({
  name: "Interval counter",
  parameters: {
    docs: {
      description: {
        story:
          "`createIntervalCounter` returns an accessor that increments on every tick. Pass a reactive accessor as the interval to change the speed at runtime.",
      },
    },
  },
  render: () => {
    const [interval, setInterval] = createSignal<number | false>(1000);
    const count = createIntervalCounter(interval);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createIntervalCounter</h3>

        <div style={{ "font-size": "3rem", "font-weight": "bold", "font-variant-numeric": "tabular-nums", "text-align": "center" }}>
          {count()}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center", "flex-wrap": "wrap" }}>
          <span style={{ "font-size": "0.85rem", color: "#64748b" }}>Interval:</span>
          {([100, 250, 500, 1000] as const).map(ms => (
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
            Pause
          </button>
        </div>
      </div>
    );
  },
});
