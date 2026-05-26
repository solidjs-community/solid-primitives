import { createSignal, createTrackedEffect } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createStaticStore, createDerivedStaticStore } from "@solid-primitives/static-store";
import readme from "../README.md?raw";
import { Button, Container } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/Static Store",
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

export const CreateStaticStoreStory = meta.story({
  name: "createStaticStore",
  parameters: {
    docs: {
      description: {
        story:
          "`createStaticStore(init)` returns a shallowly reactive object and a setter. Only the first-level properties defined in `init` are reactive — the shape is fixed at creation time. The setter supports three forms: `set(key, value)` for a single key, `set({ ...partial })` for a partial object merge, and `set(prev => ...)` for a function that receives the current store.",
      },
    },
  },
  render: () => {
    const [size, setSize] = createStaticStore({ width: 200, height: 120 });

    return (
      <Container width={380}>
        <h3 style={{ margin: 0 }}>createStaticStore</h3>

        <div
          style={{
            background: "#0f172a",
            "border-radius": "8px",
            height: "160px",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            overflow: "hidden",
            padding: "0.5rem",
          }}
        >
          <div
            style={{
              width: `${Math.min(size.width, 330)}px`,
              height: `${Math.min(size.height, 148)}px`,
              background: "#6366f1",
              "border-radius": "6px",
              transition: "all 0.2s ease",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              color: "white",
              "font-size": "0.85rem",
              "font-weight": "600",
            }}
          >
            {size.width} × {size.height}
          </div>
        </div>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
          <span
            style={{ "font-size": "0.8rem", color: "#64748b", "font-family": "monospace" }}
          >
            setSize("width", fn) — key-value
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              onClick={() => setSize("width", w => Math.max(60, w - 20))}
              variant="outline"
              style={{ flex: 1 }}
            >
              Width −
            </Button>
            <Button
              onClick={() => setSize("width", w => w + 20)}
              variant="outline"
              style={{ flex: 1 }}
            >
              Width +
            </Button>
          </div>
        </div>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
          <span
            style={{ "font-size": "0.8rem", color: "#64748b", "font-family": "monospace" }}
          >
            {`setSize({ height }) — partial object`}
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              onClick={() => setSize({ height: Math.max(40, size.height - 20) })}
              variant="outline"
              style={{ flex: 1 }}
            >
              Height −
            </Button>
            <Button
              onClick={() => setSize({ height: size.height + 20 })}
              variant="outline"
              style={{ flex: 1 }}
            >
              Height +
            </Button>
          </div>
        </div>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
          <span
            style={{ "font-size": "0.8rem", color: "#64748b", "font-family": "monospace" }}
          >
            setSize(prev =&gt; ...) — function
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              onClick={() =>
                setSize(prev => ({ width: prev.width + 10, height: prev.height + 10 }))
              }
              variant="outline"
              style={{ flex: 1 }}
            >
              Grow both
            </Button>
            <Button
              onClick={() => setSize({ width: 200, height: 120 })}
              variant="outline"
              style={{ flex: 1 }}
            >
              Reset
            </Button>
          </div>
        </div>
      </Container>
    );
  },
});

export const DerivedStaticStoreStory = meta.story({
  name: "createDerivedStaticStore",
  parameters: {
    docs: {
      description: {
        story:
          "`createDerivedStaticStore(fn)` is like `createMemo` but returns a reactive object instead of an accessor. Each key in the returned store is independently tracked — observers of `store.width` only re-run when `width` changes, even if `height` changes too. Drag one slider at a time and watch only that key's update counter increment.",
      },
    },
  },
  render: () => {
    const [source, setSource] = createSignal({ width: 200, height: 120 });
    const store = createDerivedStaticStore(source);

    const [widthTicks, setWidthTicks] = createSignal(0, { ownedWrite: true });
    const [heightTicks, setHeightTicks] = createSignal(0, { ownedWrite: true });

    createTrackedEffect(() => { store.width; setWidthTicks(n => n + 1); });
    createTrackedEffect(() => { store.height; setHeightTicks(n => n + 1); });

    return (
      <Container width={380}>
        <h3 style={{ margin: 0 }}>createDerivedStaticStore</h3>

        <div
          style={{
            background: "#0f172a",
            "border-radius": "8px",
            height: "160px",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            overflow: "hidden",
            padding: "0.5rem",
          }}
        >
          <div
            style={{
              width: `${Math.min(store.width, 330)}px`,
              height: `${Math.min(store.height, 148)}px`,
              background: "#f97316",
              "border-radius": "6px",
              transition: "all 0.2s ease",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              color: "white",
              "font-size": "0.85rem",
              "font-weight": "600",
            }}
          >
            {store.width} × {store.height}
          </div>
        </div>

        <div>
          <label style={{ "font-size": "0.85rem", color: "#64748b" }}>
            Width: {source().width}px
          </label>
          <input
            type="range"
            min={60}
            max={330}
            value={source().width}
            onInput={e => setSource(prev => ({ ...prev, width: +e.currentTarget.value }))}
            style={{ width: "100%", "margin-top": "0.25rem" }}
          />
        </div>

        <div>
          <label style={{ "font-size": "0.85rem", color: "#64748b" }}>
            Height: {source().height}px
          </label>
          <input
            type="range"
            min={40}
            max={148}
            value={source().height}
            onInput={e => setSource(prev => ({ ...prev, height: +e.currentTarget.value }))}
            style={{ width: "100%", "margin-top": "0.25rem" }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            "border-radius": "6px",
            padding: "0.6rem 0.75rem",
            "font-size": "0.85rem",
          }}
        >
          <div>
            <span style={{ color: "#64748b" }}>store.width updates: </span>
            <strong style={{ "font-variant-numeric": "tabular-nums" }}>{widthTicks()}</strong>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>store.height updates: </span>
            <strong style={{ "font-variant-numeric": "tabular-nums" }}>{heightTicks()}</strong>
          </div>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Each key has its own independent observer graph. Drag only the width slider — only the
          width tick increments. The source signal is a single object, but the store splits it into
          per-key reactive values.
        </p>
      </Container>
    );
  },
});
