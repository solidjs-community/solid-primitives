import { createSignal, For } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createTimeAgo } from "@solid-primitives/date";
import { container, toDatetimeLocal } from "./_helpers.js";
import { Stat } from "../../../.storybook/ui/index.js";

const PRESETS = [
  { label: "30 seconds ago", offset: -30_000 },
  { label: "5 minutes ago", offset: -5 * 60_000 },
  { label: "2 hours ago", offset: -2 * 3_600_000 },
  { label: "Yesterday", offset: -86_400_000 },
  { label: "Last month", offset: -30 * 86_400_000 },
  { label: "Last year", offset: -365 * 86_400_000 },
  { label: "In 1 hour", offset: 3_600_000 },
];

const meta = preview.meta({
  title: "Utilities/Date",
  parameters: { layout: "centered" },
});

export default meta;

export const TimeAgo = meta.story({
  name: "Relative time string",
  parameters: {
    docs: {
      description: {
        story:
          "`createTimeAgo` formats a date as a human-readable relative string (\"5 minutes ago\", \"last year\") and keeps it current via auto-updates. Works for future dates too (\"in 1 hour\").",
      },
    },
  },
  render: () => {
    const [offset, setOffset] = createSignal(-5 * 60_000);
    const target = () => new Date(Date.now() + offset());
    const [timeAgo, { now, difference }] = createTimeAgo(target, { interval: 1000 });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createTimeAgo</h3>

        <div style={{ display: "flex", gap: "0.4rem", "flex-wrap": "wrap" }}>
          <For each={PRESETS}>
            {p => (
              <button
                onClick={() => setOffset(p.offset)}
                style={{ "font-weight": offset() === p.offset ? "bold" : "normal" }}
              >
                {p.label}
              </button>
            )}
          </For>
        </div>

        <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem", "font-size": "0.85rem" }}>
          Custom date
          <input
            type="datetime-local"
            value={toDatetimeLocal(target())}
            onInput={e => setOffset(new Date(e.currentTarget.value).getTime() - Date.now())}
          />
        </label>

        <div style={{ "font-size": "1.5rem", "font-weight": "bold", color: "#6366f1" }}>
          {timeAgo()}
        </div>

        <div>
          <Stat label="Now">{now().toLocaleTimeString()}</Stat>
          <Stat label="Target">{target().toLocaleString()}</Stat>
          <Stat label="Difference (ms)">{difference()}</Stat>
        </div>
      </div>
    );
  },
});
