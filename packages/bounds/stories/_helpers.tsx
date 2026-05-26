import type { NullableBounds } from "@solid-primitives/bounds";
import { makeContainer, colors, font } from "../../../.storybook/ui/index.js";

export const container = makeContainer({ minWidth: 360 });

export const BoundsGrid = (props: { bounds: NullableBounds }) => (
  <div
    style={{
      display: "grid",
      "grid-template-columns": "1fr 1fr",
      gap: "0.35rem 1.5rem",
      "font-size": "0.85rem",
      "font-family": font.mono,
    }}
  >
    {(["top", "left", "bottom", "right", "width", "height"] as const).map(key => (
      <div style={{ display: "flex", "justify-content": "space-between", gap: "1rem" }}>
        <span style={{ color: colors.muted }}>{key}</span>
        <strong style={{ "font-variant-numeric": "tabular-nums" }}>
          {props.bounds[key] !== null ? `${Math.round(props.bounds[key]!)}px` : "—"}
        </strong>
      </div>
    ))}
  </div>
);
