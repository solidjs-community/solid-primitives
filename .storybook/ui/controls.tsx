import type { JSX } from "solid-js";
import { colors, font, radii } from "./tokens.js";

export const Button = (props: {
  onClick?: () => void;
  children: JSX.Element;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  color?: string;
  disabled?: boolean;
  style?: JSX.CSSProperties;
  type?: "button" | "submit" | "reset";
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void);
}) => (
  <button
    ref={props.ref}
    type={props.type ?? "button"}
    onClick={props.onClick}
    disabled={props.disabled}
    style={{
      padding: "0.5rem 1.1rem",
      "border-radius": radii.md,
      "font-size": font.sizeBase,
      "font-weight": "500",
      "font-family": font.system,
      cursor: props.disabled ? "not-allowed" : "pointer",
      opacity: props.disabled ? "0.5" : "1",
      background:
        props.color ??
        (props.variant === "secondary"
          ? colors.secondary
          : props.variant === "outline" || props.variant === "ghost"
            ? "transparent"
            : colors.primary),
      color:
        props.color != null
          ? "white"
          : props.variant === "secondary"
            ? colors.secondaryFg
            : props.variant === "outline"
              ? "#1e293b"
              : props.variant === "ghost"
                ? colors.muted
                : colors.primaryFg,
      border:
        props.variant === "outline"
          ? `1px solid ${colors.border}`
          : "none",
      ...(props.style ?? {}),
    }}
  >
    {props.children}
  </button>
);

export const btnStyle = {
  padding: "0.4rem 0.85rem",
  "border-radius": radii.md,
  border: `1px solid ${colors.border}`,
  background: colors.surface,
  cursor: "pointer",
  "font-family": font.system,
  "font-size": font.sizeBase,
} as const;

export const inputStyle = {
  padding: "0.4rem 0.75rem",
  "font-size": font.sizeBase,
  width: "100%",
  border: `1px solid ${colors.border}`,
  "border-radius": radii.md,
  "box-sizing": "border-box",
  "font-family": font.system,
} as const;

export const popoverStyle = {
  background: "white",
  border: `1px solid ${colors.border}`,
  "border-radius": radii.lg,
  padding: "1rem 1.25rem",
  "box-shadow": "0 4px 16px rgba(0,0,0,0.10)",
  "font-size": font.sizeBase,
  color: "#475569",
} as const;

export const logBox = {
  background: colors.surface,
  "border-radius": radii.md,
  border: `1px solid ${colors.border}`,
  padding: "0.6rem 0.75rem",
  "min-height": "80px",
  "font-size": "0.85rem",
  "line-height": "1.6",
} as const;

export const Label = (props: { children: string }) => (
  <label style={{ "font-size": font.sizeSm, color: colors.muted }}>{props.children}</label>
);

export const TextField = (props: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
    {props.label && <Label>{props.label}</Label>}
    <input
      type={props.type ?? "text"}
      value={props.value}
      onInput={e => props.onChange(e.currentTarget.value)}
      placeholder={props.placeholder}
      style={inputStyle}
    />
  </div>
);

export const Kbd = (props: { children: JSX.Element }) => (
  <kbd
    style={{
      display: "inline-block",
      padding: "0.15rem 0.45rem",
      "font-family": font.mono,
      "font-size": font.sizeSm,
      background: colors.secondary,
      border: `1px solid ${colors.borderStrong}`,
      "border-bottom-width": "2px",
      "border-radius": radii.sm,
      "white-space": "nowrap",
    }}
  >
    {props.children}
  </kbd>
);

export const Badge = (props: {
  children: JSX.Element;
  variant?: "default" | "info" | "success" | "warning" | "error";
}) => (
  <span
    style={{
      display: "inline-block",
      padding: "0.1rem 0.5rem",
      "border-radius": radii.full,
      "font-size": font.sizeSm,
      "font-weight": "500",
      background:
        props.variant === "success"
          ? "#dcfce7"
          : props.variant === "warning"
            ? "#fef9c3"
            : props.variant === "error"
              ? "#fee2e2"
              : props.variant === "info"
                ? "#dbeafe"
                : colors.secondary,
      color:
        props.variant === "success"
          ? "#16a34a"
          : props.variant === "warning"
            ? "#ca8a04"
            : props.variant === "error"
              ? "#dc2626"
              : props.variant === "info"
                ? "#2563eb"
                : colors.secondaryFg,
    }}
  >
    {props.children}
  </span>
);

export const Code = (props: { children: JSX.Element }) => (
  <code
    style={{
      "font-size": font.sizeSm,
      background: colors.secondary,
      padding: "0.1rem 0.4rem",
      "border-radius": radii.sm,
      "font-family": font.mono,
    }}
  >
    {props.children}
  </code>
);

export const Alert = (props: {
  children: JSX.Element;
  variant?: "info" | "warning" | "error";
}) => (
  <div
    style={{
      background:
        props.variant === "error" ? "#fee2e2" : props.variant === "info" ? "#dbeafe" : "#fef9c3",
      color:
        props.variant === "error" ? "#dc2626" : props.variant === "info" ? "#1d4ed8" : "#92400e",
      border:
        props.variant === "error"
          ? "1px solid #fca5a5"
          : props.variant === "info"
            ? "1px solid #93c5fd"
            : "1px solid #fde68a",
      "border-radius": radii.md,
      padding: "0.65rem 0.9rem",
      "font-size": font.sizeBase,
    }}
  >
    {props.children}
  </div>
);
