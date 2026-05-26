export const container = {
  "font-family": "system-ui",
  padding: "1.5rem",
  width: "380px",
  display: "flex",
  "flex-direction": "column",
  gap: "0.75rem",
} as const;

export const Section = (props: { title: string; children: any }) => (
  <div style={{ "border-top": "1px solid #e2e8f0", "padding-top": "0.75rem" }}>
    <div
      style={{
        "font-size": "0.7rem",
        "font-weight": "700",
        color: "#64748b",
        "text-transform": "uppercase",
        "letter-spacing": "0.07em",
        "margin-bottom": "0.4rem",
      }}
    >
      {props.title}
    </div>
    <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
      {props.children}
    </div>
  </div>
);

export const BoolRow = (props: { label: string; value: boolean }) => (
  <div
    style={{
      display: "flex",
      "justify-content": "space-between",
      "align-items": "baseline",
      "font-size": "0.875rem",
    }}
  >
    <span style={{ color: "#475569", "font-family": "monospace" }}>{props.label}</span>
    <strong
      style={{
        color: props.value ? "#16a34a" : "#94a3b8",
        "font-family": "monospace",
        "font-size": "0.8rem",
      }}
    >
      {String(props.value)}
    </strong>
  </div>
);
