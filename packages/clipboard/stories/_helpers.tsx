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

export const inputStyle = {
  padding: "0.4rem 0.75rem",
  "font-size": "0.9rem",
  width: "100%",
  border: "1px solid #e2e8f0",
  "border-radius": "6px",
  "box-sizing": "border-box",
  "font-family": "system-ui",
} as const;
