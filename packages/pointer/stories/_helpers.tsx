export const container = {
  "font-family": "system-ui",
  padding: "1.5rem",
  width: "420px",
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

export const TrackingBox = (props: { children: any; active?: boolean }) => (
  <div
    style={{
      width: "100%",
      height: "200px",
      border: `2px dashed ${props.active ? "#6366f1" : "#cbd5e1"}`,
      "border-radius": "10px",
      display: "flex",
      "align-items": "center",
      "justify-content": "center",
      background: props.active ? "#f5f3ff" : "#f8fafc",
      transition: "all 0.15s",
      cursor: "crosshair",
      overflow: "hidden",
      position: "relative",
      "user-select": "none",
      "touch-action": "none",
    }}
  >
    {props.children}
  </div>
);
