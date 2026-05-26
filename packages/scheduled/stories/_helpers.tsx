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

export const EventLog = (props: { entries: { label: string; time: string }[] }) => (
  <div
    style={{
      background: "#0f172a",
      "border-radius": "8px",
      padding: "0.75rem",
      "min-height": "100px",
      display: "flex",
      "flex-direction": "column",
      gap: "0.25rem",
      overflow: "hidden",
    }}
  >
    {props.entries.length === 0 ? (
      <span style={{ color: "#475569", "font-size": "0.78rem", "font-family": "monospace" }}>
        waiting…
      </span>
    ) : (
      props.entries.map((e, i) => (
        <div
          style={{
            "font-family": "monospace",
            "font-size": "0.78rem",
            color: i === 0 ? "#a5f3fc" : "#64748b",
          }}
        >
          <span style={{ color: "#f59e0b" }}>{e.label}</span> {e.time}
        </div>
      ))
    )}
  </div>
);

export const Btn = (props: { onClick: () => void; children: any; variant?: "primary" | "secondary" }) => (
  <button
    onClick={props.onClick}
    style={{
      padding: "0.5rem 1.1rem",
      background: props.variant === "secondary" ? "#f1f5f9" : "#6366f1",
      color: props.variant === "secondary" ? "#334155" : "white",
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
