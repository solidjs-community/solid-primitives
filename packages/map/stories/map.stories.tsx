import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { ReactiveMap, ReactiveWeakMap } from "@solid-primitives/map";
import readme from "../README.md?raw";
import {
  Button,
  Card,
  Container,
  Section,
  Separator,
  StatRow,
  TextField,
  colors,
  font,
  radii,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/Map",
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

export const PerEntryCounters = meta.story({
  name: "Per-entry counters",
  parameters: {
    docs: {
      description: {
        story:
          "`get(key)` subscribes to that key's value only. Incrementing Alice's score notifies Alice's row — Bob and Carol do not re-evaluate. Compare with iteration methods like `values()`, which re-run on any value change.",
      },
    },
  },
  render: () => {
    const players = ["Alice", "Bob", "Carol"] as const;
    const scores = new ReactiveMap<string, number>(players.map(p => [p, 0]));

    return (
      <Container width={300}>
        <For each={players}>
          {player => (
            <Card>
              <div
                style={{
                  display: "flex",
                  "justify-content": "space-between",
                  "align-items": "center",
                }}
              >
                <span style={{ "font-size": font.sizeBase, "font-weight": "500" }}>{player}</span>
                <div style={{ display: "flex", "align-items": "center", gap: "0.4rem" }}>
                  <strong
                    style={{
                      "font-variant-numeric": "tabular-nums",
                      "min-width": "2.5ch",
                      "text-align": "center",
                      "font-size": font.sizeMd,
                      "font-family": font.mono,
                    }}
                  >
                    {scores.get(player) ?? 0}
                  </strong>
                  <Button
                    variant="outline"
                    onClick={() => scores.set(player, Math.max(0, (scores.get(player) ?? 0) - 1))}
                  >
                    −
                  </Button>
                  <Button onClick={() => scores.set(player, (scores.get(player) ?? 0) + 1)}>
                    +
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </For>
        <Separator />
        <StatRow label="map.size" value={scores.size} />
      </Container>
    );
  },
});

export const AddRemoveEntries = meta.story({
  name: "Add & remove entries",
  parameters: {
    docs: {
      description: {
        story:
          "Iteration methods (`entries()`, `size`) react to any structural change. Setting an existing key to the same value is a no-op and will not trigger the list to re-render.",
      },
    },
  },
  render: () => {
    const [key, setKey] = createSignal("");
    const [val, setVal] = createSignal("");
    const store = new ReactiveMap<string, string>();

    const add = () => {
      const k = key().trim();
      if (!k) return;
      store.set(k, val().trim());
      setKey("");
      setVal("");
    };

    return (
      <Container width={340}>
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.4rem" }}>
          <TextField label="Key" value={key()} onChange={setKey} placeholder="key" />
          <TextField label="Value" value={val()} onChange={setVal} placeholder="value" />
          <Button onClick={add} disabled={!key().trim()}>
            Set entry
          </Button>
        </div>

        <Section title="Entries">
          <Show
            when={store.size > 0}
            fallback={
              <span
                style={{ color: colors.mutedFg, "font-size": font.sizeSm, "font-style": "italic" }}
              >
                No entries yet
              </span>
            }
          >
            <For each={[...store.entries()]}>
              {([k, v]) => (
                <div
                  style={{
                    display: "flex",
                    "align-items": "center",
                    gap: "0.4rem",
                  }}
                >
                  <code
                    style={{
                      "font-family": font.mono,
                      "font-size": font.sizeSm,
                      background: colors.secondary,
                      padding: "0.1rem 0.4rem",
                      "border-radius": radii.sm,
                      "white-space": "nowrap",
                    }}
                  >
                    {k}
                  </code>
                  <span
                    style={{
                      flex: 1,
                      color: colors.muted,
                      "font-size": font.sizeSm,
                      overflow: "hidden",
                      "text-overflow": "ellipsis",
                      "white-space": "nowrap",
                    }}
                  >
                    {v || <em style={{ color: colors.mutedFg }}>""</em>}
                  </span>
                  <Button variant="ghost" onClick={() => store.delete(k)}>
                    ×
                  </Button>
                </div>
              )}
            </For>
          </Show>
        </Section>

        <Separator />
        <StatRow label="map.size" value={store.size} />
      </Container>
    );
  },
});

export const ObjectKeyedState = meta.story({
  name: "Object-keyed state",
  parameters: {
    docs: {
      description: {
        story:
          "`ReactiveWeakMap` keys are object references. State is associated with each object without preventing garbage collection when the object is no longer referenced elsewhere. Each row tracks its own key independently via `get(item)`.",
      },
    },
  },
  render: () => {
    const items = [
      { id: 1, label: "Apples" },
      { id: 2, label: "Bananas" },
      { id: 3, label: "Cherries" },
      { id: 4, label: "Dates" },
    ];

    const checked = new ReactiveWeakMap<(typeof items)[number], boolean>();

    return (
      <Container width={280}>
        <For each={items}>
          {item => (
            <button
              type="button"
              aria-pressed={checked.get(item) ?? false}
              style={{
                display: "flex",
                "justify-content": "space-between",
                "align-items": "center",
                width: "100%",
                padding: "0.5rem 0.75rem",
                background: checked.get(item) ? "#ede9fe" : colors.surface,
                border: `1px solid ${checked.get(item) ? "#8b5cf6" : colors.border}`,
                "border-radius": radii.md,
                cursor: "pointer",
                font: "inherit",
                "text-align": "left",
              }}
              onClick={() => checked.set(item, !checked.get(item))}
            >
              <span style={{ "font-size": font.sizeBase }}>{item.label}</span>
              <Show
                when={checked.get(item)}
                fallback={
                  <span style={{ color: colors.mutedFg, "font-size": font.sizeSm }}>○</span>
                }
              >
                <span style={{ color: "#7c3aed" }}>✓</span>
              </Show>
            </button>
          )}
        </For>
        <Separator />
        <StatRow
          label="Checked"
          value={`${items.filter(i => checked.get(i)).length} / ${items.length}`}
        />
      </Container>
    );
  },
});
