export const Stat = (props: { label: string; children: string | number }) => (
  <div style={{ display: "flex", gap: "1rem", "align-items": "baseline", "margin-bottom": "0.4rem" }}>
    <span style={{ color: "#64748b", "font-size": "0.85rem", "min-width": "110px" }}>{props.label}</span>
    <strong style={{ "font-variant-numeric": "tabular-nums" }}>{props.children}</strong>
  </div>
);

export const container = {
  "font-family": "system-ui",
  padding: "1.5rem",
  width: "360px",
  display: "flex",
  "flex-direction": "column",
  gap: "1rem",
} as const;
