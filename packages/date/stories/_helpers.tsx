export const formatMs = (ms: number): string => {
  const abs = Math.abs(ms);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  const seconds = Math.floor((abs % 60_000) / 1_000);
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  if (minutes || hours || days) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return (ms < 0 ? "−" : "") + parts.join(" ");
};

export const toDatetimeLocal = (date: Date): string => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
};

export const Stat = (props: { label: string; children: string | number }) => (
  <div style={{ display: "flex", gap: "1rem", "align-items": "baseline", "margin-bottom": "0.4rem" }}>
    <span style={{ color: "#64748b", "font-size": "0.85rem", "min-width": "140px" }}>{props.label}</span>
    <strong style={{ "font-variant-numeric": "tabular-nums", "font-size": "1rem" }}>
      {props.children}
    </strong>
  </div>
);

export const container = {
  "font-family": "system-ui",
  padding: "1.5rem",
  "min-width": "340px",
  display: "flex",
  "flex-direction": "column",
  gap: "1rem",
} as const;
