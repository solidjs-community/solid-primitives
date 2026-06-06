import { colors } from "../../../.storybook/ui/index.js";

export const TrackingBox = (props: { children: any; active?: boolean }) => (
  <div
    style={{
      width: "100%",
      height: "200px",
      border: `2px dashed ${props.active ? colors.primary : "#cbd5e1"}`,
      "border-radius": "10px",
      display: "flex",
      "align-items": "center",
      "justify-content": "center",
      background: props.active ? "#f5f3ff" : colors.surface,
      transition: "all 0.15s",
      cursor: "crosshair",
      overflow: "hidden",
      position: "relative",
      "user-select": "none",
      "touch-action": "none",
    }}
  >
    {props.children}
  </div>
);
