import { createSignal, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createMousePosition,
  createPositionToElement,
  useMousePosition,
} from "@solid-primitives/mouse";
import readme from "../README.md?raw";
import {
  BoolRow,
  Button,
  ButtonRow,
  Card,
  Container,
  StatRow,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Inputs/Mouse",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: readme,
      },
    },
  },
});

export default meta;

export const GlobalCursorTracker = meta.story({
  name: "Global cursor tracker",
  parameters: {
    docs: {
      description: {
        story:
          "`useMousePosition` is a singleton root — it shares a single set of window event listeners across all consumers. Move your mouse anywhere on the page to see live coordinates and `sourceType`.",
      },
    },
  },
  render: () => {
    const pos = useMousePosition();

    return (
      <Container minWidth={280}>
        <Card>
          <StatRow label="x" value={Math.round(pos.x)} />
          <StatRow label="y" value={Math.round(pos.y)} />
          <StatRow label="sourceType" value={String(pos.sourceType)} />
          <BoolRow label="isInside" value={pos.isInside} />
        </Card>
        <p style={{ "font-size": "0.8rem", color: "#64748b", margin: 0 }}>
          Move your mouse anywhere on the page — shared listeners update all consumers.
        </p>
      </Container>
    );
  },
});

export const HoverZoneDetection = meta.story({
  name: "Hover zone detection",
  parameters: {
    docs: {
      description: {
        story:
          "`createMousePosition` scoped to an element tracks position and `isInside` only within that target. The box reacts as the cursor enters and leaves.",
      },
    },
  },
  render: () => {
    let ref!: HTMLDivElement;
    const pos = createMousePosition(() => ref);

    return (
      <Container minWidth={300}>
        <div
          ref={ref}
          style={{
            width: "260px",
            height: "120px",
            background: pos.isInside ? "#6366f1" : "#e2e8f0",
            "border-radius": "8px",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            cursor: "crosshair",
            transition: "background 0.2s",
            "user-select": "none",
          }}
        >
          <span
            style={{
              "font-weight": "500",
              color: pos.isInside ? "white" : "#94a3b8",
            }}
          >
            {pos.isInside ? "Inside" : "Hover me"}
          </span>
        </div>
        <Card>
          <BoolRow label="isInside" value={pos.isInside} />
          <StatRow label="x" value={Math.round(pos.x)} />
          <StatRow label="y" value={Math.round(pos.y)} />
        </Card>
      </Container>
    );
  },
});

export const RelativeCursorInElement = meta.story({
  name: "Relative cursor in element",
  parameters: {
    docs: {
      description: {
        story:
          "`createPositionToElement` converts page-level coordinates into element-relative ones. A dot follows your cursor within the box using the computed `x` and `y` offsets.",
      },
    },
  },
  render: () => {
    const mouse = useMousePosition();
    let ref!: HTMLDivElement;
    const relative = createPositionToElement(() => ref, () => mouse, {
      initialValue: { isInside: false },
    });

    return (
      <Container minWidth={300}>
        <div
          ref={ref}
          style={{
            width: "260px",
            height: "150px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            "border-radius": "8px",
            position: "relative",
            overflow: "hidden",
            cursor: "none",
          }}
        >
          <Show when={relative.isInside}>
            <div
              style={{
                position: "absolute",
                width: "12px",
                height: "12px",
                background: "#6366f1",
                "border-radius": "50%",
                "box-shadow": "0 0 0 4px rgba(99,102,241,0.2)",
                transform: `translate(${relative.x - 6}px, ${relative.y - 6}px)`,
                "pointer-events": "none",
              }}
            />
          </Show>
          <div
            style={{
              position: "absolute",
              inset: "0",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              color: "#94a3b8",
              "font-size": "0.85rem",
              "pointer-events": "none",
              opacity: relative.isInside ? 0 : 1,
            }}
          >
            Move cursor here
          </div>
        </div>
        <Card>
          <StatRow label="relative.x" value={Math.round(relative.x)} />
          <StatRow label="relative.y" value={Math.round(relative.y)} />
          <BoolRow label="isInside" value={relative.isInside} />
        </Card>
      </Container>
    );
  },
});

export const ReactiveTargetSwitch = meta.story({
  name: "Reactive target switch",
  parameters: {
    docs: {
      description: {
        story:
          "The `target` argument accepts a signal accessor — listeners re-attach whenever it changes. Toggle which box is tracked, then hover to see `isInside` respond only to the active target.",
      },
    },
  },
  render: () => {
    const [activeBox, setActiveBox] = createSignal<"A" | "B">("A");
    let refA!: HTMLDivElement;
    let refB!: HTMLDivElement;

    const pos = createMousePosition(() => (activeBox() === "A" ? refA : refB));

    return (
      <Container minWidth={300}>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <div
            ref={refA}
            style={{
              flex: "1",
              height: "90px",
              "border-radius": "8px",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              cursor: "crosshair",
              "user-select": "none",
              transition: "background 0.15s",
              background:
                activeBox() === "A" && pos.isInside
                  ? "#6366f1"
                  : activeBox() === "A"
                    ? "#eef2ff"
                    : "#f1f5f9",
              color:
                activeBox() === "A" && pos.isInside
                  ? "white"
                  : activeBox() === "A"
                    ? "#6366f1"
                    : "#94a3b8",
              border: activeBox() === "A" ? "2px solid #6366f1" : "2px solid transparent",
              "font-weight": "500",
            }}
          >
            Box A
          </div>
          <div
            ref={refB}
            style={{
              flex: "1",
              height: "90px",
              "border-radius": "8px",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              cursor: "crosshair",
              "user-select": "none",
              transition: "background 0.15s",
              background:
                activeBox() === "B" && pos.isInside
                  ? "#6366f1"
                  : activeBox() === "B"
                    ? "#eef2ff"
                    : "#f1f5f9",
              color:
                activeBox() === "B" && pos.isInside
                  ? "white"
                  : activeBox() === "B"
                    ? "#6366f1"
                    : "#94a3b8",
              border: activeBox() === "B" ? "2px solid #6366f1" : "2px solid transparent",
              "font-weight": "500",
            }}
          >
            Box B
          </div>
        </div>
        <ButtonRow>
          <Button
            variant={activeBox() === "A" ? "primary" : "secondary"}
            onClick={() => setActiveBox("A")}
          >
            Track A
          </Button>
          <Button
            variant={activeBox() === "B" ? "primary" : "secondary"}
            onClick={() => setActiveBox("B")}
          >
            Track B
          </Button>
        </ButtonRow>
        <Card>
          <StatRow label="tracking" value={`Box ${activeBox()}`} />
          <BoolRow label="isInside" value={pos.isInside} />
          <StatRow label="x" value={Math.round(pos.x)} />
          <StatRow label="y" value={Math.round(pos.y)} />
        </Card>
      </Container>
    );
  },
});
