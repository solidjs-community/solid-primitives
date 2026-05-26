import { makeContainer } from "../../../.storybook/ui/index.js";

export const container = makeContainer(380);

export const channelBadge = {
  display: "inline-block",
  padding: "0.05rem 0.45rem",
  background: "#dbeafe",
  color: "#1d4ed8",
  "border-radius": "4px",
  "font-size": "0.78rem",
  "font-family": "monospace",
} as const;
