export const container = {
  "font-family": "system-ui",
  padding: "1.5rem",
  width: "360px",
  display: "flex",
  "flex-direction": "column",
  gap: "1rem",
} as const;

export const Kbd = (props: { children: any }) => (
  <kbd
    style={{
      display: "inline-block",
      padding: "0.15rem 0.45rem",
      "font-family": "monospace",
      "font-size": "0.82rem",
      background: "#f1f5f9",
      border: "1px solid #cbd5e1",
      "border-bottom-width": "2px",
      "border-radius": "4px",
      "white-space": "nowrap",
    }}
  >
    {props.children}
  </kbd>
);
