import { createSignal, For } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createMutationObserver, mutationObserver } from "@solid-primitives/mutation-observer";
import readme from "../README.md?raw";

const container = {
  "font-family": "system-ui",
  padding: "1.5rem",
  "min-width": "360px",
  display: "flex",
  "flex-direction": "column",
  gap: "1rem",
} as const;

const logBox = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  "border-radius": "6px",
  padding: "0.5rem 0.75rem",
  "min-height": "80px",
  "font-size": "0.8rem",
  "font-family": "monospace",
  color: "#334155",
} as const;

const meta = preview.meta({
  title: "DOM/Mutation Observer",
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

export const ChildListObserver = meta.story({
  name: "Child list mutations",
  parameters: {
    docs: {
      description: {
        story:
          "`createMutationObserver` with `{ childList: true }` fires whenever direct children are added or removed. The returned `add` function doubles as a JSX `ref` — attach it to any element and the observer starts automatically after the component settles.",
      },
    },
  },
  render: () => {
    const [items, setItems] = createSignal<number[]>([1, 2, 3]);
    const [log, setLog] = createSignal<string[]>([]);
    let nextId = 4;

    const pushLog = (msg: string) => setLog(l => [msg, ...l].slice(0, 8));

    const [add] = createMutationObserver([], { childList: true }, records => {
      for (const r of records) {
        if (r.addedNodes.length) pushLog(`+ added ${r.addedNodes.length} child node`);
        if (r.removedNodes.length) pushLog(`− removed ${r.removedNodes.length} child node`);
      }
    });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createMutationObserver — childList</h3>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setItems(i => [...i, nextId++])}>+ Add child</button>
          <button onClick={() => setItems(i => i.slice(0, -1))} disabled={items().length === 0}>
            − Remove last
          </button>
        </div>

        <div
          ref={add}
          style={{
            "min-height": "72px",
            border: "1px solid #e2e8f0",
            "border-radius": "8px",
            padding: "0.5rem",
            display: "flex",
            "flex-wrap": "wrap",
            gap: "0.4rem",
            "align-content": "start",
          }}
        >
          <For each={items()}>
            {id => (
              <div
                style={{
                  background: "#6366f1",
                  color: "white",
                  "border-radius": "4px",
                  padding: "0.3rem 0.7rem",
                  "font-size": "0.8rem",
                  "font-weight": "600",
                }}
              >
                Item {id}
              </div>
            )}
          </For>
        </div>

        <div style={logBox}>
          <For each={log()}>
            {(entry, i) => (
              <div style={{ color: i() === 0 ? "#1e293b" : "#94a3b8", "line-height": "1.6" }}>
                {entry}
              </div>
            )}
          </For>
          {log().length === 0 && (
            <span style={{ color: "#94a3b8" }}>Add or remove children to see mutation records…</span>
          )}
        </div>
      </div>
    );
  },
});

export const AttributeObserver = meta.story({
  name: "Attribute changes",
  parameters: {
    docs: {
      description: {
        story:
          "`{ attributes: true, attributeOldValue: true }` records every attribute mutation along with its previous value. Toggle the controls below to change `class` and `style` attributes and watch the records stream in.",
      },
    },
  },
  render: () => {
    const [highlighted, setHighlighted] = createSignal(false);
    const [large, setLarge] = createSignal(false);
    const [log, setLog] = createSignal<string[]>([]);

    const pushLog = (msg: string) => setLog(l => [msg, ...l].slice(0, 8));

    const [add] = createMutationObserver(
      [],
      { attributes: true, attributeOldValue: true, attributeFilter: ["class", "style"] },
      records => {
        for (const r of records) {
          pushLog(`attr "${r.attributeName}" changed (was: ${r.oldValue ?? "—"})`);
        }
      },
    );

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createMutationObserver — attributes</h3>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setHighlighted(h => !h)}>Toggle class</button>
          <button onClick={() => setLarge(l => !l)}>Toggle font size</button>
        </div>

        <div
          ref={add}
          class={highlighted() ? "highlighted" : ""}
          style={{
            "border-radius": "8px",
            background: highlighted() ? "#fef3c7" : "#f1f5f9",
            border: `2px solid ${highlighted() ? "#f59e0b" : "#e2e8f0"}`,
            padding: "1rem",
            "text-align": "center",
            "font-weight": "600",
            "font-size": large() ? "1.4rem" : "0.95rem",
            transition: "all 0.2s",
          }}
        >
          Observed element
        </div>

        <div style={logBox}>
          <For each={log()}>
            {(entry, i) => (
              <div style={{ color: i() === 0 ? "#1e293b" : "#94a3b8", "line-height": "1.6" }}>
                {entry}
              </div>
            )}
          </For>
          {log().length === 0 && (
            <span style={{ color: "#94a3b8" }}>Toggle controls above to see attribute records…</span>
          )}
        </div>
      </div>
    );
  },
});

export const PerElementOptions = meta.story({
  name: "Per-element options",
  parameters: {
    docs: {
      description: {
        story:
          "Pass `[[el, options], ...]` tuples to observe multiple elements with different configurations from a single observer instance. Here one element watches `childList` and another watches `attributes` — a single shared callback receives all records.",
      },
    },
  },
  render: () => {
    const [childCount, setChildCount] = createSignal(2);
    const [bold, setBold] = createSignal(false);
    const [log, setLog] = createSignal<string[]>([]);

    const pushLog = (msg: string) => setLog(l => [msg, ...l].slice(0, 8));

    let childEl!: HTMLDivElement;
    let attrEl!: HTMLDivElement;

    createMutationObserver(
      () => [
        [childEl, { childList: true }],
        [attrEl, { attributes: true, attributeOldValue: true }],
      ],
      records => {
        for (const r of records) {
          if (r.type === "childList")
            pushLog(`childList on #children: ${r.addedNodes.length} added, ${r.removedNodes.length} removed`);
          if (r.type === "attributes")
            pushLog(`attr "${r.attributeName}" on #attrs (was: ${r.oldValue ?? "—"})`);
        }
      },
    );

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>Per-element options</h3>

        <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <p style={{ margin: "0 0 0.4rem", "font-size": "0.8rem", color: "#64748b" }}>
              childList observer
            </p>
            <div style={{ display: "flex", gap: "0.4rem", "margin-bottom": "0.5rem" }}>
              <button style={{ "font-size": "0.8rem" }} onClick={() => setChildCount(n => n + 1)}>
                + Add
              </button>
              <button
                style={{ "font-size": "0.8rem" }}
                onClick={() => setChildCount(n => Math.max(0, n - 1))}
                disabled={childCount() === 0}
              >
                − Remove
              </button>
            </div>
            <div
              ref={el => (childEl = el)}
              style={{
                border: "1px solid #e2e8f0",
                "border-radius": "6px",
                padding: "0.4rem",
                "min-height": "40px",
                display: "flex",
                "flex-wrap": "wrap",
                gap: "0.3rem",
              }}
            >
              <For each={Array.from({ length: childCount() }, (_, i) => i)}>
                {i => (
                  <div
                    style={{
                      background: "#10b981",
                      color: "white",
                      "border-radius": "3px",
                      padding: "0.2rem 0.5rem",
                      "font-size": "0.75rem",
                    }}
                  >
                    {i + 1}
                  </div>
                )}
              </For>
            </div>
          </div>

          <div>
            <p style={{ margin: "0 0 0.4rem", "font-size": "0.8rem", color: "#64748b" }}>
              attributes observer
            </p>
            <button
              style={{ "font-size": "0.8rem", "margin-bottom": "0.5rem" }}
              onClick={() => setBold(b => !b)}
            >
              Toggle bold
            </button>
            <div
              ref={el => (attrEl = el)}
              style={{
                border: "1px solid #e2e8f0",
                "border-radius": "6px",
                padding: "0.5rem",
                "font-weight": bold() ? "700" : "400",
                "font-size": "0.85rem",
                color: "#334155",
              }}
            >
              Watch my style
            </div>
          </div>
        </div>

        <div style={logBox}>
          <For each={log()}>
            {(entry, i) => (
              <div style={{ color: i() === 0 ? "#1e293b" : "#94a3b8", "line-height": "1.6" }}>
                {entry}
              </div>
            )}
          </For>
          {log().length === 0 && (
            <span style={{ color: "#94a3b8" }}>Interact with either element above…</span>
          )}
        </div>
      </div>
    );
  },
});

export const StandaloneRef = meta.story({
  name: "mutationObserver (standalone ref)",
  parameters: {
    docs: {
      description: {
        story:
          "`mutationObserver(options, callback)` is a self-contained ref factory — drop it directly on a JSX `ref` prop with no separate primitive call. Best for one-off observation of a single element.",
      },
    },
  },
  render: () => {
    const [items, setItems] = createSignal([1, 2, 3]);
    const [mutationCount, setMutationCount] = createSignal(0);
    let nextId = 4;

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>mutationObserver — standalone ref</h3>
        <p style={{ margin: 0, "font-size": "0.85rem", color: "#64748b" }}>
          The observer is wired up via a single <code>ref</code> attribute — no separate setup.
        </p>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setItems(i => [...i, nextId++])}>+ Add</button>
          <button onClick={() => setItems(i => i.slice(0, -1))} disabled={items().length === 0}>
            − Remove
          </button>
        </div>

        <div
          ref={mutationObserver({ childList: true }, () => setMutationCount(c => c + 1))}
          style={{
            "min-height": "56px",
            border: "1px solid #e2e8f0",
            "border-radius": "8px",
            padding: "0.5rem",
            display: "flex",
            "flex-wrap": "wrap",
            gap: "0.4rem",
            "align-content": "start",
          }}
        >
          <For each={items()}>
            {id => (
              <div
                style={{
                  background: "#f97316",
                  color: "white",
                  "border-radius": "4px",
                  padding: "0.3rem 0.7rem",
                  "font-size": "0.8rem",
                  "font-weight": "600",
                }}
              >
                {id}
              </div>
            )}
          </For>
        </div>

        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
            "font-size": "0.85rem",
            padding: "0.5rem 0.75rem",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            "border-radius": "6px",
          }}
        >
          <span style={{ color: "#64748b" }}>Mutation records fired</span>
          <strong style={{ "font-variant-numeric": "tabular-nums", "font-size": "1.1rem" }}>
            {mutationCount()}
          </strong>
        </div>
      </div>
    );
  },
});
