import { createMemo, createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createTrigger, createTriggerCache } from "@solid-primitives/trigger";
import readme from "../README.md?raw";
import { Button, Container } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/Trigger",
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

export const BasicTrigger = meta.story({
  name: "createTrigger",
  parameters: {
    docs: {
      description: {
        story:
          "`createTrigger()` returns a `[track, dirty]` pair. Calling `track()` inside a computation subscribes it. Calling `dirty()` later re-runs every subscribed computation — independent of any signal values. This lets you invalidate reactive computations imperatively, without a data model.",
      },
    },
  },
  render: () => {
    const [track, dirty] = createTrigger();
    const [noise, setNoise] = createSignal(0);
    let count = 0;
    const runCount = createMemo(() => { track(); return ++count; });

    return (
      <Container>
        <h3 style={{ margin: 0 }}>createTrigger</h3>

        <div
          style={{
            padding: "1rem",
            background: "#f8fafc",
            "border-radius": "8px",
            border: "1px solid #e2e8f0",
            display: "flex",
            "flex-direction": "column",
            gap: "0.4rem",
          }}
        >
          <div
            style={{
              display: "flex",
              "justify-content": "space-between",
              "align-items": "baseline",
            }}
          >
            <span style={{ color: "#64748b", "font-size": "0.85rem" }}>memo re-evaluations</span>
            <strong
              style={{
                "font-family": "monospace",
                "font-size": "2rem",
                color: "#6366f1",
                "font-variant-numeric": "tabular-nums",
              }}
            >
              {runCount()}
            </strong>
          </div>
          <div
            style={{
              display: "flex",
              "justify-content": "space-between",
              "font-size": "0.82rem",
            }}
          >
            <span style={{ color: "#64748b" }}>noise signal (unrelated)</span>
            <span style={{ "font-family": "monospace", color: "#94a3b8" }}>{noise()}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button onClick={() => dirty()} style={{ flex: 1 }}>
            dirty() — invalidate
          </Button>
          <Button onClick={() => setNoise(n => n + 1)} variant="outline" style={{ flex: 1 }}>
            setNoise() — no update
          </Button>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Only <code>dirty()</code> re-runs the tracked memo. Changing the unrelated{" "}
          <code>noise</code> signal leaves the counter unchanged — the trigger is decoupled
          from any data model.
        </p>
      </Container>
    );
  },
});

export const TriggerCacheStory = meta.story({
  name: "createTriggerCache — per-key invalidation",
  parameters: {
    docs: {
      description: {
        story:
          "`createTriggerCache()` returns `[track, dirty, dirtyAll]`. Each key gets its own trigger, so `dirty(key)` only re-runs computations that called `track(key)`. `dirtyAll()` invalidates every tracked key at once. Use it to build fine-grained reactive structures where you want row-level or slot-level invalidation.",
      },
    },
  },
  render: () => {
    const [track, dirty, dirtyAll] = createTriggerCache<number>();

    let c1 = 0, c2 = 0, c3 = 0;
    const run1 = createMemo(() => { track(1); return ++c1; });
    const run2 = createMemo(() => { track(2); return ++c2; });
    const run3 = createMemo(() => { track(3); return ++c3; });

    const rows = [
      { key: 1, run: run1 },
      { key: 2, run: run2 },
      { key: 3, run: run3 },
    ] as const;

    return (
      <Container>
        <h3 style={{ margin: 0 }}>createTriggerCache</h3>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
          {rows.map(row => (
            <div
              style={{
                padding: "0.65rem 1rem",
                background: "#f8fafc",
                "border-radius": "8px",
                border: "1px solid #e2e8f0",
                display: "flex",
                "align-items": "center",
                "justify-content": "space-between",
                gap: "0.5rem",
              }}
            >
              <span style={{ color: "#64748b", "font-size": "0.85rem" }}>key {row.key}</span>
              <span
                style={{
                  "font-family": "monospace",
                  color: "#6366f1",
                  "font-variant-numeric": "tabular-nums",
                  "font-weight": "600",
                }}
              >
                {row.run()} evaluations
              </span>
              <Button onClick={() => dirty(row.key)} variant="outline">
                dirty({row.key})
              </Button>
            </div>
          ))}
        </div>

        <Button onClick={() => dirtyAll()} color="#0f172a">
          dirtyAll() — invalidate every key
        </Button>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Each row has its own trigger. <code>dirty(1)</code> only re-evaluates the memo
          tracking key 1, leaving keys 2 and 3 untouched. <code>dirtyAll()</code> invalidates
          all three at once.
        </p>
      </Container>
    );
  },
});
