import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { Key, Entries, SetValues, Rerun } from "@solid-primitives/keyed";
import readme from "../README.md?raw";
import { Card, ButtonRow, Button, Container } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Control Flow/Keyed",
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

type Item = { id: number; name: string; color: string };

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

let _nextId = 1;
const makeItem = (name: string): Item => ({
  id: _nextId++,
  name,
  color: COLORS[(_nextId - 1) % COLORS.length]!,
});

export const KeyComponent = meta.story({
  name: "Key — identity-preserving mapping",
  parameters: {
    docs: {
      description: {
        story:
          "`<Key>` identifies items by a key rather than by position. When you click-count an item then shuffle the list, the counter stays with that item's key — it is the **same component instance**. With Solid's `<For>`, shuffling reassigns values to position-based instances and the counts move with the slots, not the items.",
      },
    },
  },
  render: () => {
    const [items, setItems] = createSignal<Item[]>([
      makeItem("Alpha"),
      makeItem("Beta"),
      makeItem("Gamma"),
      makeItem("Delta"),
    ]);

    const shuffle = () =>
      setItems(prev => {
        const copy = [...prev];
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j]!, copy[i]!];
        }
        return copy;
      });

    const reverse = () => setItems(prev => [...prev].reverse());

    const addItem = () =>
      setItems(prev => [...prev, makeItem(`Item ${_nextId}`)]);

    const removeFirst = () => setItems(prev => prev.slice(1));

    return (
      <Container width={400}>
        <h3 style={{ margin: 0 }}>
          {"<Key by=\"id\">"}
        </h3>

        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            gap: "0.35rem",
          }}
        >
          <Key each={items()} by="id" fallback={<p style={{ color: "#94a3b8" }}>No items</p>}>
            {item => {
              const [clicks, setClicks] = createSignal(0);
              return (
                <div
                  style={{
                    display: "flex",
                    "align-items": "center",
                    gap: "0.75rem",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    "border-radius": "6px",
                    padding: "0.5rem 0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      "border-radius": "50%",
                      background: item().color,
                      "flex-shrink": 0,
                    }}
                  />
                  <span style={{ flex: 1, "font-size": "0.9rem" }}>{item().name}</span>
                  <span style={{ "font-size": "0.78rem", color: "#94a3b8" }}>
                    id:{item().id}
                  </span>
                  {/* Color changes based on item color — not a generic action button */}
                  <button
                    onClick={() => setClicks(c => c + 1)}
                    style={{
                      "font-size": "0.8rem",
                      padding: "0.2rem 0.5rem",
                      "border-radius": "4px",
                      border: "1px solid #e2e8f0",
                      background: clicks() > 0 ? item().color : "white",
                      color: clicks() > 0 ? "white" : "#475569",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                  >
                    clicks: {clicks()}
                  </button>
                </div>
              );
            }}
          </Key>
        </div>

        <ButtonRow>
          <Button onClick={shuffle} variant="outline">Shuffle</Button>
          <Button onClick={reverse} variant="outline">Reverse</Button>
          <Button onClick={addItem}>Add item</Button>
          <Button onClick={removeFirst} disabled={items().length === 0} variant="outline">
            Remove first
          </Button>
        </ButtonRow>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Click-count any item, then shuffle or reverse — the count stays with that item's{" "}
          <code>id</code>, not its position.
        </p>
      </Container>
    );
  },
});

export const EntriesComponent = meta.story({
  name: "Entries — reactive object iteration",
  parameters: {
    docs: {
      description: {
        story:
          "`<Entries>` iterates `Object.entries(of)` reactively. The render function receives the static key and a **value signal** — no remount when only the value changes.",
      },
    },
  },
  render: () => {
    const [scores, setScores] = createSignal<Record<string, number>>({
      Alice: 87,
      Bob: 42,
      Carol: 95,
      Dave: 61,
    });

    const addPlayer = () => {
      const names = ["Eve", "Frank", "Grace", "Heidi", "Ivan"];
      const existing = Object.keys(scores());
      const name = names.find(n => !existing.includes(n));
      if (name) setScores(s => ({ ...s, [name]: Math.floor(Math.random() * 100) }));
    };

    const removeLast = () =>
      setScores(s => {
        const keys = Object.keys(s);
        if (keys.length === 0) return s;
        const { [keys[keys.length - 1]!]: _, ...rest } = s;
        return rest as Record<string, number>;
      });

    const randomize = () =>
      setScores(s =>
        Object.fromEntries(Object.keys(s).map(k => [k, Math.floor(Math.random() * 100)])),
      );

    return (
      <Container width={400}>
        <h3 style={{ margin: 0 }}>
          {"<Entries of={scores}>"}
        </h3>

        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            gap: "0.4rem",
          }}
        >
          <Entries of={scores()} fallback={<p style={{ color: "#94a3b8" }}>No players</p>}>
            {(name, score) => (
              <div
                style={{
                  display: "flex",
                  "align-items": "center",
                  gap: "0.75rem",
                  "font-size": "0.9rem",
                }}
              >
                <span style={{ "min-width": "60px", color: "#475569" }}>{name}</span>
                <div
                  style={{
                    flex: 1,
                    height: "18px",
                    background: "#f1f5f9",
                    "border-radius": "9px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${score()}%`,
                      background: "#6366f1",
                      "border-radius": "9px",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    "min-width": "32px",
                    "text-align": "right",
                    "font-variant-numeric": "tabular-nums",
                    "font-family": "monospace",
                    "font-weight": "600",
                  }}
                >
                  {score()}
                </span>
              </div>
            )}
          </Entries>
        </div>

        <ButtonRow>
          <Button onClick={randomize}>Randomize scores</Button>
          <Button onClick={addPlayer} disabled={Object.keys(scores()).length >= 5} variant="outline">
            Add player
          </Button>
          <Button onClick={removeLast} disabled={Object.keys(scores()).length === 0} variant="outline">
            Remove last
          </Button>
        </ButtonRow>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          The bar widths are driven by a value signal — only the bars update when scores change, no
          row remount.
        </p>
      </Container>
    );
  },
});

export const SetValuesComponent = meta.story({
  name: "SetValues — reactive Set iteration",
  parameters: {
    docs: {
      description: {
        story:
          "`<SetValues>` iterates a `Set` reactively, respecting insertion order. Items are identified by value — adding a duplicate is a no-op.",
      },
    },
  },
  render: () => {
    const TAGS = ["solid-js", "typescript", "vite", "vitest", "storybook", "pnpm", "monorepo"];
    const [selected, setSelected] = createSignal(new Set(["solid-js", "typescript"]));

    const toggle = (tag: string) =>
      setSelected(s => {
        const next = new Set(s);
        next.has(tag) ? next.delete(tag) : next.add(tag);
        return next;
      });

    const clear = () => setSelected(new Set<string>());

    return (
      <Container width={400}>
        <h3 style={{ margin: 0 }}>
          {"<SetValues of={selected}>"}
        </h3>

        <div style={{ display: "flex", gap: "0.4rem", "flex-wrap": "wrap" }}>
          <For each={TAGS}>
            {tag => (
              <Button
                onClick={() => toggle(tag)}
                variant={selected().has(tag) ? "primary" : "outline"}
                style={{ "border-radius": "999px", padding: "0.3rem 0.65rem", "font-size": "0.82rem" }}
              >
                {tag}
              </Button>
            )}
          </For>
        </div>

        <Card>
          <div style={{ "font-size": "0.8rem", color: "#64748b", "margin-bottom": "0.35rem" }}>
            Selected tags ({selected().size}):
          </div>
          <div style={{ display: "flex", gap: "0.4rem", "flex-wrap": "wrap", "min-height": "28px" }}>
            <SetValues
              of={selected()}
              fallback={<span style={{ color: "#94a3b8", "font-size": "0.85rem" }}>none</span>}
            >
              {value => (
                <span
                  style={{
                    display: "inline-flex",
                    "align-items": "center",
                    gap: "0.3rem",
                    padding: "0.2rem 0.55rem",
                    "border-radius": "4px",
                    background: "#e0e7ff",
                    color: "#4338ca",
                    "font-size": "0.82rem",
                    "font-family": "monospace",
                  }}
                >
                  {value}
                </span>
              )}
            </SetValues>
          </div>
        </Card>

        <Button
          onClick={clear}
          disabled={selected().size === 0}
          variant="outline"
          style={{ "align-self": "flex-start" }}
        >
          Clear all
        </Button>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Tags render in insertion order. Adding a tag that already exists is a no-op.
        </p>
      </Container>
    );
  },
});

export const RerunComponent = meta.story({
  name: "Rerun — forced remount on key change",
  parameters: {
    docs: {
      description: {
        story:
          "`<Rerun>` destroys and recreates its children whenever the `on` key changes — equivalent to Vue's `v-key` and Svelte's `{#key}`. The children function receives the current and previous key values.",
      },
    },
  },
  render: () => {
    const TABS = ["Overview", "Details", "Settings"] as const;
    type Tab = (typeof TABS)[number];
    const [tab, setTab] = createSignal<Tab>("Overview");

    return (
      <Container width={400}>
        <h3 style={{ margin: 0 }}>
          {"<Rerun on={tab}>"}
        </h3>

        {/* Tab navigation — custom underline styling, kept as <button> */}
        <div style={{ display: "flex", gap: 0, "border-bottom": "2px solid #e2e8f0" }}>
          <For each={TABS}>
            {t => (
              <button
                onClick={() => setTab(t)}
                style={{
                  padding: "0.5rem 1rem",
                  border: "none",
                  background: "transparent",
                  "border-bottom": tab() === t ? "2px solid #6366f1" : "2px solid transparent",
                  "margin-bottom": "-2px",
                  color: tab() === t ? "#6366f1" : "#64748b",
                  "font-weight": tab() === t ? "600" : "400",
                  cursor: "pointer",
                  "font-size": "0.9rem",
                }}
              >
                {t}
              </button>
            )}
          </For>
        </div>

        <Rerun on={tab}>
          {(currentTab, prevTab) => {
            const [localCount, setLocalCount] = createSignal(0);
            const mountedAt = new Date().toLocaleTimeString();

            return (
              <Card>
                <div style={{ "font-size": "0.9rem", "font-weight": "600", color: "#1e293b" }}>
                  {currentTab}
                </div>
                <Show when={prevTab !== undefined}>
                  <div style={{ "font-size": "0.8rem", color: "#94a3b8" }}>
                    Previous tab: {prevTab as string}
                  </div>
                </Show>
                <div style={{ "font-size": "0.8rem", color: "#64748b" }}>
                  Mounted at: <code>{mountedAt}</code>
                </div>
                <div
                  style={{
                    display: "flex",
                    "align-items": "center",
                    gap: "0.75rem",
                    "margin-top": "0.25rem",
                  }}
                >
                  <span style={{ "font-size": "0.85rem", color: "#475569" }}>
                    Local counter: <strong>{localCount()}</strong>
                  </span>
                  <Button
                    onClick={() => setLocalCount(c => c + 1)}
                    variant="outline"
                    style={{ "font-size": "0.82rem" }}
                  >
                    +1
                  </Button>
                </div>
              </Card>
            );
          }}
        </Rerun>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Increment the counter, then switch tabs — the count resets because the child is fully
          remounted. The mount timestamp confirms a fresh instance.
        </p>
      </Container>
    );
  },
});
