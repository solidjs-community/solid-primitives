import type { NullableBounds } from "@solid-primitives/bounds";

export const container = {
  "font-family": "system-ui",
  padding: "1.5rem",
  "min-width": "360px",
  display: "flex",
  "flex-direction": "column",
  gap: "1rem",
} as const;

export const BoundsGrid = (props: { bounds: NullableBounds }) => (
  <div
    style={{
      display: "grid",
      "grid-template-columns": "1fr 1fr",
      gap: "0.35rem 1.5rem",
      "font-size": "0.85rem",
      "font-family": "monospace",
    }}
  >
    {(["top", "left", "bottom", "right", "width", "height"] as const).map(key => (
      <div style={{ display: "flex", "justify-content": "space-between", gap: "1rem" }}>
        <span style={{ color: "#64748b" }}>{key}</span>
        <strong style={{ "font-variant-numeric": "tabular-nums" }}>
          {props.bounds[key] !== null ? `${Math.round(props.bounds[key]!)}px` : "—"}
        </strong>
      </div>
    ))}
  </div>
);
