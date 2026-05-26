import { createSignal, For } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createControllableSignal,
  createControllableBooleanSignal,
  createControllableArraySignal,
  createControllableSetSignal,
} from "@solid-primitives/controlled-signal";
import readme from "../README.md?raw";
import { container } from "./_helpers.js";
import { btnStyle, inputStyle } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/Controlled Signal",
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

export const UncontrolledStory = meta.story({
  name: "createControllableSignal — uncontrolled",
  parameters: {
    docs: {
      description: {
        story:
          "In **uncontrolled** mode (no `value` prop), the signal manages its own internal state starting from `defaultValue`. Calling `setValue` updates the internal signal and fires `onChange`. The functional setter form `setValue(prev => ...)` is fully supported.",
      },
    },
  },
  render: () => {
    const [changeLog, setChangeLog] = createSignal<number[]>([]);

    const [count, setCount] = createControllableSignal<number>({
      defaultValue: () => 0,
      onChange: val => setChangeLog(prev => [val, ...prev].slice(0, 5)),
    });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>Uncontrolled mode</h3>

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <button
            onClick={() => setCount(prev => (prev ?? 0) - 1)}
            style={{ ...btnStyle, width: "40px", "text-align": "center", padding: "0.4rem" }}
          >
            −
          </button>
          <span
            style={{
              flex: 1,
              "text-align": "center",
              "font-size": "2.5rem",
              "font-weight": "700",
              "font-variant-numeric": "tabular-nums",
            }}
          >
            {count() ?? 0}
          </span>
          <button
            onClick={() => setCount(prev => (prev ?? 0) + 1)}
            style={{ ...btnStyle, width: "40px", "text-align": "center", padding: "0.4rem" }}
          >
            +
          </button>
        </div>

        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
            "font-size": "0.85rem",
          }}
        >
          <span style={{ color: "#64748b" }}>onChange history:</span>
          <code style={{ color: "#334155" }}>[{changeLog().join(", ")}]</code>
        </div>

        <button
          onClick={() => setCount(0)}
          style={{ ...btnStyle, display: "block", width: "100%", "text-align": "center" }}
        >
          Reset to 0
        </button>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          No <code>value</code> prop — the signal owns its state, initialized to{" "}
          <code>defaultValue: 0</code>. Every <code>setValue</code> call also fires{" "}
          <code>onChange</code>.
        </p>
      </div>
    );
  },
});

export const ControlledStory = meta.story({
  name: "createControllableSignal — controlled",
  parameters: {
    docs: {
      description: {
        story:
          "In **controlled** mode (a `value` prop is provided), the signal defers entirely to the external value. `setValue` calls `onChange` but does not update internal state — the parent is responsible for updating its own signal. The preset buttons below bypass the component entirely and set the parent signal directly, demonstrating that the parent owns the state.",
      },
    },
  },
  render: () => {
    const [external, setExternal] = createSignal(5);

    const [count, setCount] = createControllableSignal<number>({
      value: external,
      onChange: setExternal,
    });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>Controlled mode</h3>

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <button
            onClick={() => setCount(prev => (prev ?? 0) - 1)}
            style={{ ...btnStyle, width: "40px", "text-align": "center", padding: "0.4rem" }}
          >
            −
          </button>
          <span
            style={{
              flex: 1,
              "text-align": "center",
              "font-size": "2.5rem",
              "font-weight": "700",
              "font-variant-numeric": "tabular-nums",
            }}
          >
            {count()}
          </span>
          <button
            onClick={() => setCount(prev => (prev ?? 0) + 1)}
            style={{ ...btnStyle, width: "40px", "text-align": "center", padding: "0.4rem" }}
          >
            +
          </button>
        </div>

        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
            "font-size": "0.85rem",
          }}
        >
          <span style={{ color: "#64748b" }}>Parent sets value:</span>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <For each={[0, 5, 10, 25]}>
              {val => (
                <button
                  onClick={() => setExternal(val)}
                  style={{
                    ...btnStyle,
                    padding: "0.25rem 0.55rem",
                    "font-size": "0.8rem",
                    background: external() === val ? "#6366f1" : "#f8fafc",
                    color: external() === val ? "white" : "#1e293b",
                    border: external() === val ? "1px solid #6366f1" : "1px solid #e2e8f0",
                  }}
                >
                  {val}
                </button>
              )}
            </For>
          </div>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          A <code>value</code> prop is provided — the signal defers to the external state.{" "}
          <code>+/−</code> calls <code>onChange → setExternal</code>; the preset buttons set the
          parent signal directly, bypassing the component.
        </p>
      </div>
    );
  },
});

export const TypedVariantsStory = meta.story({
  name: "Typed Variants",
  parameters: {
    docs: {
      description: {
        story:
          "Three typed variants guarantee a non-`undefined` default when the signal is unset: `createControllableBooleanSignal` → `false`, `createControllableArraySignal` → `[]`, `createControllableSetSignal` → `new Set()`. All accept the same controlled/uncontrolled props as the base primitive.",
      },
    },
  },
  render: () => {
    const [open, setOpen] = createControllableBooleanSignal({ defaultValue: () => false });

    const [tagDraft, setTagDraft] = createSignal("");
    const [tags, setTags] = createControllableArraySignal<string>({
      defaultValue: () => ["solid", "primitives"],
    });

    const frameworks = ["React", "Solid", "Vue", "Svelte"];
    const [selected, setSelected] = createControllableSetSignal<string>({
      defaultValue: () => new Set(["Solid"]),
    });

    const addTag = () => {
      const t = tagDraft().trim();
      if (t && !tags().includes(t)) {
        setTags(prev => [...prev, t]);
        setTagDraft("");
      }
    };

    const toggleFramework = (fw: string) =>
      setSelected(prev => {
        const next = new Set(prev);
        if (next.has(fw)) next.delete(fw);
        else next.add(fw);
        return next;
      });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>Typed Variants</h3>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.4rem" }}>
          <span style={{ "font-size": "0.8rem", color: "#64748b", "font-family": "monospace" }}>
            createControllableBooleanSignal
          </span>
          <button
            onClick={() => setOpen(p => !p)}
            style={{
              ...btnStyle,
              "align-self": "flex-start",
              background: open() ? "#16a34a" : "#f8fafc",
              color: open() ? "white" : "#1e293b",
              border: open() ? "1px solid #16a34a" : "1px solid #e2e8f0",
            }}
          >
            {open() ? "Open" : "Closed"} — click to toggle
          </button>
        </div>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.4rem" }}>
          <span style={{ "font-size": "0.8rem", color: "#64748b", "font-family": "monospace" }}>
            createControllableArraySignal
          </span>
          <div style={{ display: "flex", gap: "0.4rem", "flex-wrap": "wrap" }}>
            <For each={tags()}>
              {tag => (
                <span
                  style={{
                    background: "#e0f2fe",
                    color: "#0369a1",
                    "border-radius": "4px",
                    padding: "0.15rem 0.45rem",
                    "font-size": "0.8rem",
                    display: "flex",
                    gap: "0.3rem",
                    "align-items": "center",
                  }}
                >
                  {tag}
                  <button
                    onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#0369a1",
                      padding: 0,
                      "line-height": 1,
                      "font-size": "0.95rem",
                    }}
                  >
                    ×
                  </button>
                </span>
              )}
            </For>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              value={tagDraft()}
              onInput={e => setTagDraft(e.currentTarget.value)}
              placeholder="Add tag…"
              style={{ ...inputStyle, "font-size": "0.85rem" }}
              onKeyDown={e => e.key === "Enter" && addTag()}
            />
            <button onClick={addTag} style={btnStyle}>
              Add
            </button>
          </div>
        </div>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.4rem" }}>
          <span style={{ "font-size": "0.8rem", color: "#64748b", "font-family": "monospace" }}>
            createControllableSetSignal
          </span>
          <div style={{ display: "flex", gap: "0.4rem", "flex-wrap": "wrap" }}>
            <For each={frameworks}>
              {fw => (
                <button
                  onClick={() => toggleFramework(fw)}
                  style={{
                    ...btnStyle,
                    background: selected().has(fw) ? "#6366f1" : "#f8fafc",
                    color: selected().has(fw) ? "white" : "#1e293b",
                    border: selected().has(fw) ? "1px solid #6366f1" : "1px solid #e2e8f0",
                  }}
                >
                  {fw}
                </button>
              )}
            </For>
          </div>
          <span style={{ "font-size": "0.8rem", color: "#64748b" }}>
            Selected: {[...selected()].join(", ") || "(none)"}
          </span>
        </div>
      </div>
    );
  },
});
