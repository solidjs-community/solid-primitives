import { createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { pan, longPress, pinch, rotate, swipe, tap, doubleTap } from "@solid-primitives/gestures";
import readme from "../README.md?raw";
import {
  Container,
  EventLog,
  Section,
  StatRow,
  colors,
  font,
  radii,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Inputs/Gestures",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: { component: readme },
    },
  },
});

export default meta;

const zone = {
  width: "100%",
  height: "130px",
  "border-radius": radii.lg,
  display: "flex",
  "align-items": "center" as const,
  "justify-content": "center" as const,
  "touch-action": "none" as const,
  "user-select": "none" as const,
  cursor: "crosshair" as const,
};

export const PanStory = meta.story({
  name: "Drag position coordinates",
  parameters: {
    docs: {
      description: {
        story:
          "`pan` fires on every `pointermove` with a single active pointer. Coordinates are element-relative; pointer capture keeps events flowing past the element edges during a drag.",
      },
    },
  },
  render: () => {
    const [pos, setPos] = createSignal<{ x: number; y: number } | null>(null);
    const [active, setActive] = createSignal(false);

    return (
      <Container width={280}>
        <div
          ref={pan({ callback: p => setPos(p) })}
          onPointerDown={() => setActive(true)}
          onPointerUp={() => setActive(false)}
          onPointerCancel={() => setActive(false)}
          style={{
            ...zone,
            background: active() ? "#f5f3ff" : colors.surface,
            border: `2px dashed ${active() ? colors.primary : colors.border}`,
          }}
        >
          <span
            style={{
              color: active() ? colors.primary : colors.muted,
              "font-size": font.sizeSm,
              "font-family": font.mono,
            }}
          >
            {active() && pos() ? `(${pos()!.x}, ${pos()!.y})` : "drag here"}
          </span>
        </div>
        <Section title="Last position">
          <StatRow label="x" value={pos()?.x ?? "—"} />
          <StatRow label="y" value={pos()?.y ?? "—"} />
        </Section>
      </Container>
    );
  },
});

export const LongPressStory = meta.story({
  name: "Hold-to-fire after 500 ms",
  parameters: {
    docs: {
      description: {
        story:
          "`longPress` waits for the pointer to remain stationary for `threshold` ms (default 500). Moving more than `moveThreshold` px (default 10) or releasing early cancels it.",
      },
    },
  },
  render: () => {
    const [last, setLast] = createSignal<{ x: number; y: number } | null>(null);
    const [holding, setHolding] = createSignal(false);
    const [fired, setFired] = createSignal(false);

    return (
      <Container width={280}>
        <div
          ref={longPress({
            callback: pos => {
              setLast(pos);
              setFired(true);
              setHolding(false);
              setTimeout(() => setFired(false), 700);
            },
          })}
          onPointerDown={() => setHolding(true)}
          onPointerUp={() => setHolding(false)}
          onPointerCancel={() => setHolding(false)}
          style={{
            ...zone,
            background: fired() ? "#dcfce7" : holding() ? "#fef9c3" : colors.surface,
            border: `2px dashed ${fired() ? colors.success : holding() ? "#f59e0b" : colors.border}`,
          }}
        >
          <span
            style={{
              color: fired() ? colors.success : holding() ? "#92400e" : colors.muted,
              "font-size": font.sizeSm,
              "font-family": font.mono,
            }}
          >
            {fired() ? "fired!" : holding() ? "hold…" : "hold for 500 ms"}
          </span>
        </div>
        <Section title="Last fire">
          <StatRow label="x" value={last()?.x ?? "—"} />
          <StatRow label="y" value={last()?.y ?? "—"} />
        </Section>
      </Container>
    );
  },
});

export const PinchStory = meta.story({
  name: "Two-finger pinch scale",
  parameters: {
    docs: {
      description: {
        story:
          "`pinch` fires as two pointers move closer or farther apart. `scale` is relative to the initial distance (1.0 = original distance). Requires a touch device or DevTools touch emulation.",
      },
    },
  },
  render: () => {
    const [scale, setScale] = createSignal<number | null>(null);
    const [center, setCenter] = createSignal<{ x: number; y: number } | null>(null);

    return (
      <Container width={280}>
        <div
          ref={pinch({
            callback: (s, c) => {
              setScale(s);
              setCenter(c);
            },
          })}
          style={{ ...zone, border: `2px dashed ${colors.border}` }}
        >
          <span style={{ color: colors.muted, "font-size": font.sizeSm, "font-family": font.mono }}>
            {scale() !== null ? `scale: ${scale()!.toFixed(2)}×` : "pinch with 2 fingers"}
          </span>
        </div>
        <Section title="Current">
          <StatRow label="scale" value={scale() !== null ? scale()!.toFixed(3) : "—"} />
          <StatRow label="center x" value={center()?.x ?? "—"} />
          <StatRow label="center y" value={center()?.y ?? "—"} />
        </Section>
        <p style={{ margin: 0, "font-size": "0.75rem", color: colors.mutedFg }}>
          Use DevTools → device emulator for multi-touch simulation.
        </p>
      </Container>
    );
  },
});

export const RotateStory = meta.story({
  name: "Two-finger rotation angle",
  parameters: {
    docs: {
      description: {
        story:
          "`rotate` fires as two pointers rotate around their midpoint. `rotation` is in degrees relative to the initial angle when the second pointer was placed, clamped to –180°…180°.",
      },
    },
  },
  render: () => {
    const [angle, setAngle] = createSignal<number | null>(null);
    const [center, setCenter] = createSignal<{ x: number; y: number } | null>(null);

    return (
      <Container width={280}>
        <div
          ref={rotate({
            callback: (r, c) => {
              setAngle(r);
              setCenter(c);
            },
          })}
          style={{ ...zone, border: `2px dashed ${colors.border}` }}
        >
          <span style={{ color: colors.muted, "font-size": font.sizeSm, "font-family": font.mono }}>
            {angle() !== null ? `${angle()!.toFixed(1)}°` : "rotate with 2 fingers"}
          </span>
        </div>
        <Section title="Current">
          <StatRow label="rotation" value={angle() !== null ? `${angle()!.toFixed(2)}°` : "—"} />
          <StatRow label="center x" value={center()?.x ?? "—"} />
          <StatRow label="center y" value={center()?.y ?? "—"} />
        </Section>
        <p style={{ margin: 0, "font-size": "0.75rem", color: colors.mutedFg }}>
          Use DevTools → device emulator for multi-touch simulation.
        </p>
      </Container>
    );
  },
});

export const SwipeStory = meta.story({
  name: "Swipe direction detector",
  parameters: {
    docs: {
      description: {
        story:
          "`swipe` fires once when a fast directional flick completes. Movement on one axis must be at least twice the other — diagonal gestures are ignored. Default: ≥60 px in ≤300 ms.",
      },
    },
  },
  render: () => {
    const ARROWS: Record<string, string> = { top: "↑", right: "→", bottom: "↓", left: "←" };
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);

    return (
      <Container width={280}>
        <div
          ref={swipe({
            callback: dir => {
              const now = new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });
              setLog(prev =>
                [{ label: `${ARROWS[dir] ?? ""} ${dir}`, time: now }, ...prev].slice(0, 5),
              );
            },
          })}
          style={{ ...zone, border: `2px dashed ${colors.border}` }}
        >
          <span style={{ color: colors.muted, "font-size": font.sizeSm }}>swipe here</span>
        </div>
        <EventLog entries={log()} />
      </Container>
    );
  },
});

export const DoubleTapStory = meta.story({
  name: "Double-tap to confirm",
  parameters: {
    docs: {
      description: {
        story:
          "`doubleTap` fires when two taps land within `timeframe` ms (default 300) and `positionThreshold` px (default 30) of each other. A single tap alone never fires the callback — no delays imposed on other gesture handlers.",
      },
    },
  },
  render: () => {
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);
    const [flash, setFlash] = createSignal(false);

    return (
      <Container width={280}>
        <div
          ref={doubleTap({
            callback: pos => {
              const now = new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });
              setLog(prev =>
                [{ label: `double-tap (${pos.x}, ${pos.y})`, time: now }, ...prev].slice(0, 5),
              );
              setFlash(true);
              setTimeout(() => setFlash(false), 400);
            },
          })}
          style={{
            ...zone,
            background: flash() ? "#f5f3ff" : colors.surface,
            border: `2px dashed ${flash() ? colors.primary : colors.border}`,
            cursor: "pointer",
          }}
        >
          <span
            style={{
              color: flash() ? colors.primary : colors.muted,
              "font-size": font.sizeSm,
              "font-family": font.mono,
            }}
          >
            {flash() ? "confirmed!" : "double-tap here"}
          </span>
        </div>
        <EventLog entries={log()} />
      </Container>
    );
  },
});

export const TapStory = meta.story({
  name: "Tap position log",
  parameters: {
    docs: {
      description: {
        story:
          "`tap` fires when a pointer is pressed and released with less than 4 px of drift. The returned position is the release point, element-relative. Use `maximumTapLength` to reject long holds.",
      },
    },
  },
  render: () => {
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);

    return (
      <Container width={280}>
        <div
          ref={tap({
            callback: pos => {
              const now = new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });
              setLog(prev =>
                [{ label: `tap (${pos.x}, ${pos.y})`, time: now }, ...prev].slice(0, 5),
              );
            },
          })}
          style={{ ...zone, border: `2px dashed ${colors.border}`, cursor: "pointer" }}
        >
          <span style={{ color: colors.muted, "font-size": font.sizeSm }}>tap here</span>
        </div>
        <EventLog entries={log()} />
      </Container>
    );
  },
});
