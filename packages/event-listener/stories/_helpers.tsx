export const container = {
  "font-family": "system-ui",
  padding: "1.5rem",
  width: "400px",
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

export const Card = (props: { children: any }) => (
  <div
    style={{
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      "border-radius": "8px",
      padding: "0.75rem",
      display: "flex",
      "flex-direction": "column",
      gap: "0.4rem",
    }}
  >
    {props.children}
  </div>
);

export const Btn = (props: { onClick: () => void; children: any; color?: string }) => (
  <button
    onClick={props.onClick}
    style={{
      padding: "0.5rem 1.1rem",
      background: props.color ?? "#6366f1",
      color: "white",
      border: "none",
      "border-radius": "6px",
      "font-size": "0.9rem",
      "font-weight": "500",
      cursor: "pointer",
      "font-family": "system-ui",
    }}
  >
    {props.children}
  </button>
);
