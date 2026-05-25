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

export const Card = (props: { children: any }) => (
  <div
    style={{
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      "border-radius": "8px",
      padding: "1rem",
      display: "flex",
      "flex-direction": "column",
      gap: "0.5rem",
    }}
  >
    {props.children}
  </div>
);

export const Divider = () => (
  <hr style={{ border: "none", "border-top": "1px solid #e2e8f0", margin: 0 }} />
);

export const ButtonRow = (props: { children: any }) => (
  <div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>{props.children}</div>
);
