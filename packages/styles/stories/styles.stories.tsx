import { createSignal, createEffect, onCleanup } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createRemSize, useRemSize, getRemSize } from "@solid-primitives/styles";
import readme from "../README.md?raw";

const container = {
  "font-family": "system-ui",
  padding: "1.5rem",
  "min-width": "360px",
  display: "flex",
  "flex-direction": "column",
  gap: "1rem",
} as const;

function injectRootFontSize(px: number, styleEl: HTMLStyleElement) {
  styleEl.textContent = `:root { font-size: ${px}px !important; }`;
}

const meta = preview.meta({
  title: "CSS/Styles",
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

export const RemSizeSignal = meta.story({
  name: "createRemSize",
  parameters: {
    docs: {
      description: {
        story:
          "`createRemSize()` returns a reactive signal that tracks the document root's `font-size` in pixels. It uses a hidden `ResizeObserver` sentinel element — when the root em size changes, the signal updates automatically. Drag the slider to override the root `font-size` and watch the signal react.",
      },
    },
  },
  render: () => {
    const remSize = createRemSize();
    const [override, setOverride] = createSignal(16);

    const styleEl = document.createElement("style");
    document.head.appendChild(styleEl);
    onCleanup(() => styleEl.remove());

    // Split-form createEffect required in Solid 2.0
    createEffect(
      () => override(),
      px => injectRootFontSize(px, styleEl),
    );

    const ratio = () => remSize() / 16;
    const barColor = () => (ratio() > 1 ? "#10b981" : ratio() < 1 ? "#f97316" : "#6366f1");

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createRemSize</h3>

        <label style={{ "font-size": "0.85rem", color: "#64748b" }}>
          Root font-size override: <strong>{override()}px</strong>
          <input
            type="range"
            min="8"
            max="32"
            value={override()}
            onInput={e => setOverride(+e.currentTarget.value)}
            style={{ display: "block", width: "100%", "margin-top": "0.35rem" }}
          />
        </label>

        <div
          style={{
            padding: "1.25rem",
            "border-radius": "8px",
            border: `2px solid ${barColor()}`,
            background: "#f8fafc",
            "text-align": "center",
          }}
        >
          <div
            style={{
              "font-size": "2.5rem",
              "font-weight": "700",
              color: barColor(),
              "line-height": 1,
              "font-variant-numeric": "tabular-nums",
            }}
          >
            {remSize()}px
          </div>
          <div style={{ "font-size": "0.8rem", color: "#64748b", "margin-top": "0.4rem" }}>
            current rem size (reactive signal)
          </div>
        </div>

        <div
          style={{
            display: "grid",
            "grid-template-columns": "1fr 1fr",
            gap: "0.5rem",
            "font-size": "0.82rem",
          }}
        >
          <div
            style={{
              padding: "0.5rem 0.75rem",
              background: "#f1f5f9",
              "border-radius": "6px",
              display: "flex",
              "flex-direction": "column",
              gap: "0.15rem",
            }}
          >
            <span style={{ color: "#64748b" }}>getRemSize() snapshot</span>
            <strong style={{ "font-variant-numeric": "tabular-nums", "font-family": "monospace", color: "#1e293b" }}>
              {getRemSize()}px
            </strong>
          </div>
          <div
            style={{
              padding: "0.5rem 0.75rem",
              background: "#f1f5f9",
              "border-radius": "6px",
              display: "flex",
              "flex-direction": "column",
              gap: "0.15rem",
            }}
          >
            <span style={{ color: "#64748b" }}>remSize() signal</span>
            <strong style={{ "font-variant-numeric": "tabular-nums", "font-family": "monospace", color: "#1e293b" }}>
              {remSize()}px
            </strong>
          </div>
          <div
            style={{
              padding: "0.5rem 0.75rem",
              background: "#f1f5f9",
              "border-radius": "6px",
              display: "flex",
              "flex-direction": "column",
              gap: "0.15rem",
            }}
          >
            <span style={{ color: "#64748b" }}>ratio vs 16px baseline</span>
            <strong style={{ "font-variant-numeric": "tabular-nums", "font-family": "monospace", color: "#1e293b" }}>
              ×{ratio().toFixed(2)}
            </strong>
          </div>
          <div
            style={{
              padding: "0.5rem 0.75rem",
              background: "#f1f5f9",
              "border-radius": "6px",
              display: "flex",
              "flex-direction": "column",
              gap: "0.15rem",
            }}
          >
            <span style={{ color: "#64748b" }}>1rem equals</span>
            <strong style={{ "font-variant-numeric": "tabular-nums", "font-family": "monospace", color: "#1e293b" }}>
              {remSize()}px
            </strong>
          </div>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          The slider injects <code>:root {"{ font-size: Npx }"}</code> via a{" "}
          <code>{"<style>"}</code> tag. The signal updates via the internal ResizeObserver sentinel.
        </p>
      </div>
    );
  },
});

export const SingletonRemSize = meta.story({
  name: "useRemSize (singleton)",
  parameters: {
    docs: {
      description: {
        story:
          "`useRemSize()` is a singleton root variant of `createRemSize`. All consumers share a single hidden sentinel element and `ResizeObserver` — no matter how many components call it. Both cards below call `useRemSize()` independently yet always agree. Drag the slider to confirm they update in lockstep.",
      },
    },
  },
  render: () => {
    const [override, setOverride] = createSignal(16);

    const styleEl = document.createElement("style");
    document.head.appendChild(styleEl);
    onCleanup(() => styleEl.remove());

    createEffect(
      () => override(),
      px => injectRootFontSize(px, styleEl),
    );

    const ConsumerCard = (props: { label: string; color: string }) => {
      const remSize = useRemSize();
      return (
        <div
          style={{
            padding: "1.25rem",
            "border-radius": "8px",
            border: `2px solid ${props.color}`,
            background: "#f8fafc",
            "text-align": "center",
            flex: 1,
          }}
        >
          <div
            style={{
              "font-size": "2rem",
              "font-weight": "700",
              color: props.color,
              "font-variant-numeric": "tabular-nums",
            }}
          >
            {remSize()}px
          </div>
          <div style={{ "font-size": "0.75rem", color: "#64748b", "margin-top": "0.3rem" }}>
            {props.label}
          </div>
        </div>
      );
    };

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>useRemSize — shared singleton</h3>
        <p style={{ margin: 0, "font-size": "0.85rem", color: "#64748b" }}>
          Both components call <code>useRemSize()</code> independently yet share one observer
          instance.
        </p>

        <label style={{ "font-size": "0.85rem", color: "#64748b" }}>
          Root font-size override: <strong>{override()}px</strong>
          <input
            type="range"
            min="8"
            max="32"
            value={override()}
            onInput={e => setOverride(+e.currentTarget.value)}
            style={{ display: "block", width: "100%", "margin-top": "0.35rem" }}
          />
        </label>

        <div style={{ display: "flex", gap: "1rem" }}>
          <ConsumerCard label="Component A" color="#6366f1" />
          <ConsumerCard label="Component B" color="#10b981" />
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Unlike <code>createRemSize</code>, calling <code>useRemSize</code> multiple times creates
          only one hidden element and one <code>ResizeObserver</code> — ideal for app-wide use.
        </p>
      </div>
    );
  },
});
