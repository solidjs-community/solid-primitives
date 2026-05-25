export const container = {
  "font-family": "system-ui",
  padding: "1.5rem",
  width: "380px",
  display: "flex",
  "flex-direction": "column",
  gap: "1rem",
} as const;

export const btnStyle = {
  padding: "0.45rem 1rem",
  "border-radius": "6px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  cursor: "pointer",
  "font-family": "system-ui",
  "font-size": "0.9rem",
} as const;

export const popoverStyle = {
  background: "white",
  border: "1px solid #e2e8f0",
  "border-radius": "8px",
  padding: "1rem 1.25rem",
  "box-shadow": "0 4px 16px rgba(0,0,0,0.10)",
  "font-size": "0.9rem",
  color: "#475569",
} as const;
