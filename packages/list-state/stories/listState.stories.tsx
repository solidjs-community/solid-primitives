import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createListState, createMultiSelectListState } from "@solid-primitives/list-state";
import readme from "../README.md?raw";
import { container, Kbd } from "./_helpers.js";

const meta = preview.meta({
  title: "Input & Events/List State",
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

const ITEMS = ["Apple", "Banana", "Cherry", "Dragonfruit", "Elderberry", "Fig", "Grape"];

export const SingleSelect = meta.story({
  name: "Single-select (createListState)",
  parameters: {
    docs: {
      description: {
        story:
          "`createListState` manages keyboard-navigable single-select state. Click an item or use ↑/↓ to navigate, <kbd>Home</kbd>/<kbd>End</kbd> to jump to the first/last item. The list loops by default.",
      },
    },
  },
  render: () => {
    const [focused, setFocused] = createSignal(false);
    const { active, setActive, onKeyDown } = createListState({
      items: ITEMS,
      initialActive: ITEMS[0],
    });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createListState</h3>

        <ul
          role="listbox"
          tabindex={0}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            "list-style": "none",
            padding: 0,
            margin: 0,
            display: "flex",
            "flex-direction": "column",
            outline: focused() ? "2px solid #6366f1" : "2px solid transparent",
            "outline-offset": "2px",
            "border-radius": "8px",
            overflow: "hidden",
            border: "1px solid #e2e8f0",
            cursor: "default",
          }}
        >
          <For each={ITEMS}>
            {item => (
              <li
                role="option"
                aria-selected={active() === item}
                onClick={() => setActive(item)}
                style={{
                  padding: "0.6rem 0.875rem",
                  background: active() === item ? "#6366f1" : "white",
                  color: active() === item ? "white" : "#1e293b",
                  "font-size": "0.9rem",
                  "border-bottom": "1px solid #f1f5f9",
                  transition: "background 0.1s, color 0.1s",
                  "user-select": "none",
                }}
              >
                {item}
              </li>
            )}
          </For>
        </ul>

        <div
          style={{
            "font-size": "0.85rem",
            display: "flex",
            gap: "0.5rem",
            "align-items": "center",
          }}
        >
          <span style={{ color: "#64748b" }}>Active:</span>
          <strong style={{ color: "#6366f1" }}>{active() ?? "—"}</strong>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Click the list to focus it, then press <Kbd>↑</Kbd> / <Kbd>↓</Kbd>,{" "}
          <Kbd>Home</Kbd>, or <Kbd>End</Kbd> to navigate.
        </p>
      </div>
    );
  },
});

const FILES = [
  "index.ts",
  "package.json",
  "README.md",
  "tsconfig.json",
  "CHANGELOG.md",
  "LICENSE",
  "vitest.config.ts",
];

export const MultiSelect = meta.story({
  name: "Multi-select (createMultiSelectListState)",
  parameters: {
    docs: {
      description: {
        story:
          "`createMultiSelectListState` adds a three-layer model: `cursor` (keyboard focus), `active` (drag range in progress), and `selected` (committed items). Click to move the cursor; <kbd>Shift</kbd>+↑/↓ expands or contracts the active range; double-click to toggle an item in the selected set.",
      },
    },
  },
  render: () => {
    const [focused, setFocused] = createSignal(false);
    const { cursor, active, selected, setCursorActive, toggleSelected, onKeyDown } =
      createMultiSelectListState({ items: FILES });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createMultiSelectListState</h3>

        <ul
          role="listbox"
          tabindex={0}
          aria-multiselectable={true}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            "list-style": "none",
            padding: 0,
            margin: 0,
            display: "flex",
            "flex-direction": "column",
            outline: focused() ? "2px solid #6366f1" : "2px solid transparent",
            "outline-offset": "2px",
            "border-radius": "8px",
            overflow: "hidden",
            border: "1px solid #e2e8f0",
            "font-family": "monospace",
            "font-size": "0.85rem",
            cursor: "default",
          }}
        >
          <For each={FILES}>
            {item => {
              const isActive = () => active().includes(item);
              const isSelected = () => selected().includes(item);
              const isCursor = () => cursor() === item;

              return (
                <li
                  role="option"
                  aria-selected={isSelected()}
                  onClick={() => setCursorActive(item)}
                  onDblClick={() => toggleSelected(item)}
                  style={{
                    padding: "0.5rem 0.75rem",
                    background: isSelected() ? "#6366f1" : isActive() ? "#e0e7ff" : "white",
                    color: isSelected() ? "white" : "#1e293b",
                    "border-bottom": "1px solid #f1f5f9",
                    display: "flex",
                    "align-items": "center",
                    gap: "0.5rem",
                    "user-select": "none",
                    outline: isCursor() ? "2px inset #6366f1" : "none",
                    transition: "background 0.1s",
                  }}
                >
                  <span style={{ flex: 1 }}>{item}</span>
                  <Show when={isSelected()}>
                    <span style={{ opacity: 0.75, "font-size": "0.75rem", "font-family": "system-ui" }}>✓</span>
                  </Show>
                </li>
              );
            }}
          </For>
        </ul>

        <div
          style={{
            "font-size": "0.82rem",
            color: "#64748b",
            display: "flex",
            "flex-direction": "column",
            gap: "0.25rem",
          }}
        >
          <div>
            <span style={{ "font-weight": "600" }}>Selected ({selected().length}):</span>{" "}
            <Show when={selected().length > 0} fallback={<em>none</em>}>
              {selected().join(", ")}
            </Show>
          </div>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Click to focus item. <Kbd>Shift</Kbd>+<Kbd>↑</Kbd>/<Kbd>↓</Kbd> extends the range.
          Double-click to commit to selected set.
        </p>
      </div>
    );
  },
});

const ORIENTATIONS = ["vertical", "horizontal"] as const;

export const HorizontalList = meta.story({
  name: "Horizontal orientation",
  parameters: {
    docs: {
      description: {
        story:
          "Pass `orientation: \"horizontal\"` to switch the navigation keys from ↑/↓ to ←/→. Combine with `vimMode: true` to also enable h/l bindings.",
      },
    },
  },
  render: () => {
    const [vimMode, setVimMode] = createSignal(false);
    const TABS = ["Home", "About", "Work", "Blog", "Contact"];

    const { active, setActive, onKeyDown } = createListState({
      items: TABS,
      initialActive: TABS[0],
      orientation: "horizontal",
      vimMode,
    });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>Horizontal list</h3>

        <div
          role="tablist"
          tabindex={0}
          onKeyDown={onKeyDown}
          style={{
            display: "flex",
            gap: 0,
            "border-bottom": "2px solid #e2e8f0",
            outline: "none",
          }}
        >
          <For each={TABS}>
            {tab => (
              <button
                role="tab"
                aria-selected={active() === tab}
                onClick={() => setActive(tab)}
                style={{
                  padding: "0.5rem 1rem",
                  border: "none",
                  background: "transparent",
                  "border-bottom": active() === tab ? "2px solid #6366f1" : "2px solid transparent",
                  "margin-bottom": "-2px",
                  color: active() === tab ? "#6366f1" : "#64748b",
                  "font-weight": active() === tab ? "600" : "400",
                  "font-size": "0.9rem",
                  cursor: "pointer",
                  transition: "color 0.1s",
                }}
              >
                {tab}
              </button>
            )}
          </For>
        </div>

        <div
          style={{
            background: "#f8fafc",
            "border-radius": "8px",
            padding: "1rem",
            "min-height": "60px",
            "font-size": "0.9rem",
            color: "#475569",
          }}
        >
          Content for <strong>{active()}</strong>
        </div>

        <label
          style={{
            display: "flex",
            "align-items": "center",
            gap: "0.5rem",
            "font-size": "0.85rem",
            color: "#64748b",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={vimMode()}
            onChange={e => setVimMode(e.currentTarget.checked)}
          />
          Vim mode (h / l keys)
        </label>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Click the tab bar, then press <Kbd>←</Kbd> / <Kbd>→</Kbd> to navigate.
        </p>
      </div>
    );
  },
});
