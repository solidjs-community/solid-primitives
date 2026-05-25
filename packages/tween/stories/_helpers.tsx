export const container = {
  "font-family": "system-ui",
  padding: "1.5rem",
  width: "360px",
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

export const Track = (props: { value: number; color?: string }) => (
  <div
    style={{
      height: "24px",
      background: "#f1f5f9",
      "border-radius": "12px",
      overflow: "hidden",
      position: "relative",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: "0 auto 0 0",
        width: `${props.value}%`,
        background: props.color ?? "#6366f1",
        "border-radius": "12px",
        transition: "none",
      }}
    />
  </div>
);
