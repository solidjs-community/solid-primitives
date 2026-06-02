import type { Meta, StoryObj } from "@storybook/solidjs";
import { createSignal, untrack } from "solid-js";
import { makePersisted } from "../src/index.js";

const meta: Meta = {
  title: "Storage",
};
export default meta;

export const MakePersisted: StoryObj = {
  name: "makePersisted — localStorage signal",
  render: () => {
    const [value, setValue] = makePersisted(createSignal("initial value"), { name: "sb_demo_value" });
    return (
      <div style={{ display: "flex", "flex-direction": "column", gap: "12px", padding: "24px", "font-family": "sans-serif" }}>
        <h3 style={{ margin: 0 }}>Persisted signal in localStorage</h3>
        <input
          value={untrack(value)}
          onInput={ev => setValue(ev.currentTarget.value)}
          style={{ padding: "8px", "border-radius": "4px", border: "1px solid #6b7280", width: "280px" }}
        />
        <p style={{ margin: 0, color: "#6b7280" }}>
          Change the value and reload — it persists in <code>localStorage</code>.
        </p>
        <p style={{ margin: 0 }}>Current: <strong>{value()}</strong></p>
      </div>
    );
  },
};
