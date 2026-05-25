export const container = {
  "font-family": "system-ui",
  padding: "1.5rem",
  width: "400px",
  display: "flex",
  "flex-direction": "column",
  gap: "1rem",
} as const;

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

export const ButtonRow = (props: { children: any }) => (
  <div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>{props.children}</div>
);
