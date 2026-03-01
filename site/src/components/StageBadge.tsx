import type { Component } from "solid-js";
import { Tooltip } from "@kobalte/core";

const stageColors: Record<number | string, { bg: string; text: string }> = {
  0: { bg: "#FA233E", text: "white" },
  1: { bg: "#FFA15C", text: "black" },
  2: { bg: "#E9DE47", text: "black" },
  3: { bg: "#12C3A2", text: "white" },
  4: { bg: "#2962FF", text: "white" },
};

const stageDescriptions: Record<number | string, string> = {
  0: "Stage 0 – Concept / proof of concept",
  1: "Stage 1 – Development / unstable",
  2: "Stage 2 – Beta / mostly stable",
  3: "Stage 3 – Stable / production ready",
  4: "Stage 4 – Frozen / complete",
};

const StageBadge: Component<{ stage: number }> = props => {
  const colors = () => stageColors[props.stage] ?? stageColors[0]!;
  const description = () => stageDescriptions[props.stage] ?? `Stage ${props.stage}`;

  return (
    <Tooltip.Root openDelay={100} closeDelay={0}>
      <Tooltip.Trigger
        as="span"
        style={{
          display: "inline-flex",
          "align-items": "center",
          "justify-content": "center",
          width: "28px",
          height: "28px",
          "border-radius": "6px",
          "font-size": "13px",
          "font-weight": "600",
          "background-color": colors().bg,
          color: colors().text,
          "flex-shrink": "0",
          cursor: "default",
        }}
      >
        {props.stage}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          style={{
            "background-color": "var(--sb-background-color)",
            color: "var(--sb-text-color)",
            border: "1px solid color-mix(in srgb, var(--sb-decoration-color) 50%, transparent)",
            "border-radius": "6px",
            padding: "4px 10px",
            "font-size": "12px",
            "box-shadow": "0 2px 8px rgba(0,0,0,0.15)",
            "z-index": "50",
          }}
        >
          <Tooltip.Arrow />
          {description()}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};

export default StageBadge;
