import { createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createInertOthers } from "../src/index.js";
import readme from "../README.md?raw";

const meta = preview.meta({
  title: "UI Patterns/Inert",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { description: { component: readme } },
  },
});

export default meta;

export const InertOutsideLayer = meta.story({
  name: "Inert outside a layer",
  render: () => {
    const [dialog, setDialog] = createSignal<HTMLElement>();
    const [open, setOpen] = createSignal(false);
    createInertOthers(dialog, open, { strategy: "both" });
    return (
      <div style={{ display: "flex", gap: "16px", "align-items": "flex-start" }}>
        <div>
          <button onClick={() => setOpen(o => !o)}>{open() ? "Close" : "Open"} layer</button>
          <p>Outside content: inert and aria-hidden while the layer is open.</p>
          <button>Outside button</button>
        </div>
        <div ref={setDialog} role="dialog" style={{ border: "1px solid gray", padding: "8px" }}>
          <p>Layer content stays interactive.</p>
          <button onClick={() => setOpen(false)}>Dismiss</button>
        </div>
      </div>
    );
  },
});
