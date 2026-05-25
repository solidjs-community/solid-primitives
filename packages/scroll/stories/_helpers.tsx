export const container = {
  "font-family": "system-ui",
  padding: "1.5rem",
  width: "380px",
  display: "flex",
  "flex-direction": "column",
  gap: "1rem",
} as const;

export const StatRow = (props: { label: string; value: string | number }) => (
  <div
    style={{
      display: "flex",
      "justify-content": "space-between",
      "align-items": "baseline",
      "font-size": "0.9rem",
    }}
  >
    <span style={{ color: "#64748b" }}>{props.label}</span>
    <strong style={{ "font-variant-numeric": "tabular-nums", "font-family": "monospace" }}>
      {String(props.value)}
    </strong>
  </div>
);
