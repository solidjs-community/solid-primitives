import { colors, font, radii } from "../../../.storybook/ui/index.js";

/** A small inline SVG data URI — avoids needing binary assets registered in `staticDirs`. */
export const svgIcon = (fill: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">` +
      `<circle cx="32" cy="32" r="28" fill="${fill}"/>` +
      `</svg>`,
  )}`;

/** Preview box mirroring what the real (invisible-in-canvas) browser tab favicon currently is. */
export const IconPreview = (props: { href: string; label?: string }) => (
  <div style={{ display: "flex", "align-items": "center", gap: "0.6rem" }}>
    <img
      src={props.href}
      width={32}
      height={32}
      style={{
        "border-radius": radii.sm,
        border: `1px solid ${colors.border}`,
        background: colors.surface,
      }}
      alt="favicon preview"
    />
    <span style={{ "font-size": font.sizeSm, "font-family": font.mono, color: colors.muted }}>
      {props.label ?? "current favicon"}
    </span>
  </div>
);
