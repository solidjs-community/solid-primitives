import type { JSX } from "solid-js";
import { For } from "solid-js";
import { colors, font, radii } from "./tokens.js";

type ContainerOptions = { width?: number; minWidth?: number; gap?: string };

export const makeContainer = (options: ContainerOptions | number = {}): Record<string, string> => {
  const opts: ContainerOptions = typeof options === "number" ? { width: options } : options;
  return {
    "font-family": font.system,
    padding: "1.5rem",
    ...(opts.minWidth != null
      ? { "min-width": `${opts.minWidth}px` }
      : { width: `${opts.width ?? 380}px` }),
    display: "flex",
    "flex-direction": "column",
    gap: opts.gap ?? "1rem",
  };
};

export const Stat = (props: { label: string; labelWidth?: string; children: JSX.Element }) => (
  <div style={{ display: "flex", gap: "1rem", "align-items": "baseline", "margin-bottom": "0.4rem" }}>
    <span
      style={{
        color: colors.muted,
        "font-size": font.sizeSm,
        "min-width": props.labelWidth ?? "120px",
      }}
    >
      {props.label}
    </span>
    <strong style={{ "font-variant-numeric": "tabular-nums", "font-size": font.sizeMd }}>
      {props.children}
    </strong>
  </div>
);

export const StatRow = (props: { label: string; value: string | number }) => (
  <div
    style={{
      display: "flex",
      "justify-content": "space-between",
      "align-items": "baseline",
      "font-size": font.sizeBase,
    }}
  >
    <span style={{ color: colors.muted }}>{props.label}</span>
    <strong style={{ "font-variant-numeric": "tabular-nums", "font-family": font.mono }}>
      {String(props.value)}
    </strong>
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
    <span style={{ color: "#475569", "font-family": font.mono }}>{props.label}</span>
    <strong
      style={{
        color: props.value ? colors.success : colors.mutedFg,
        "font-family": font.mono,
        "font-size": font.sizeSm,
      }}
    >
      {String(props.value)}
    </strong>
  </div>
);

export const ValueDisplay = (props: { label: string; value: string }) => (
  <div style={{ display: "flex", gap: "0.5rem", "align-items": "baseline" }}>
    <span style={{ "font-size": font.sizeSm, color: colors.mutedFg }}>{props.label}:</span>
    <code
      style={{
        "font-size": font.sizeSm,
        background: colors.secondary,
        padding: "0.1rem 0.4rem",
        "border-radius": radii.sm,
        "font-family": font.mono,
      }}
    >
      {props.value || <em style={{ color: colors.border }}>empty</em>}
    </code>
  </div>
);

export const Card = (props: { children: JSX.Element }) => (
  <div
    style={{
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      "border-radius": radii.lg,
      padding: "1rem",
      display: "flex",
      "flex-direction": "column",
      gap: "0.5rem",
    }}
  >
    {props.children}
  </div>
);

export const Separator = () => (
  <hr style={{ border: "none", "border-top": `1px solid ${colors.border}`, margin: "0" }} />
);

export const Section = (props: { title: string; children: JSX.Element }) => (
  <div style={{ "border-top": `1px solid ${colors.border}`, "padding-top": "0.75rem" }}>
    <div
      style={{
        "font-size": "0.7rem",
        "font-weight": "700",
        color: colors.muted,
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

export const ButtonRow = (props: { children: JSX.Element }) => (
  <div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>{props.children}</div>
);

export const EventLog = (props: { entries: { label: string; time: string }[] }) => (
  <div
    style={{
      background: colors.dark,
      "border-radius": radii.lg,
      padding: "0.75rem",
      "min-height": "100px",
      display: "flex",
      "flex-direction": "column",
      gap: "0.25rem",
      overflow: "hidden",
    }}
  >
    {props.entries.length === 0 ? (
      <span style={{ color: "#475569", "font-size": font.sizeSm, "font-family": font.mono }}>
        waiting…
      </span>
    ) : (
      <For each={props.entries}>
        {(e, i) => (
          <div
            style={{
              "font-family": font.mono,
              "font-size": font.sizeSm,
              color: i() === 0 ? colors.darkFg : colors.muted,
            }}
          >
            <span style={{ color: colors.warning }}>{e.label}</span> {e.time}
          </div>
        )}
      </For>
    )}
  </div>
);

export const Progress = (props: { value: number; color?: string }) => (
  <div
    style={{
      height: "24px",
      background: colors.secondary,
      "border-radius": radii.full,
      overflow: "hidden",
      position: "relative",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: "0 auto 0 0",
        width: `${props.value}%`,
        background: props.color ?? colors.primary,
        "border-radius": radii.full,
        transition: "none",
      }}
    />
  </div>
);
