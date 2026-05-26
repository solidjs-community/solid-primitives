export const container = {
  "font-family": "system-ui",
  padding: "1.5rem",
  width: "380px",
  display: "flex",
  "flex-direction": "column",
  gap: "1rem",
} as const;

export const btnStyle = {
  padding: "0.4rem 0.85rem",
  "border-radius": "6px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  cursor: "pointer",
  "font-family": "system-ui",
  "font-size": "0.9rem",
} as const;

export const inputStyle = {
  padding: "0.4rem 0.75rem",
  "font-size": "0.9rem",
  flex: 1,
  border: "1px solid #e2e8f0",
  "border-radius": "6px",
  "font-family": "system-ui",
  "min-width": 0,
} as const;
