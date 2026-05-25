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
  "font-family": "monospace",
} as const;

export const Label = (props: { children: string }) => (
  <label style={{ "font-size": "0.85rem", color: "#64748b" }}>{props.children}</label>
);

export const ValueDisplay = (props: { label: string; value: string }) => (
  <div style={{ display: "flex", gap: "0.5rem", "align-items": "baseline" }}>
    <span style={{ "font-size": "0.82rem", color: "#94a3b8" }}>{props.label}:</span>
    <code
      style={{
        "font-size": "0.85rem",
        background: "#f1f5f9",
        padding: "0.1rem 0.4rem",
        "border-radius": "3px",
      }}
    >
      {props.value || <em style={{ color: "#cbd5e1" }}>empty</em>}
    </code>
  </div>
);
