import { createSignal, For } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createSpring, createDerivedSpring } from "@solid-primitives/spring";
import readme from "../README.md?raw";
import {
  Button,
  Container,
  Card,
  StatRow,
  BoolRow,
  Section,
  ButtonRow,
  ProgressBar,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Animation/Spring",
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

export const PhysicsPlayground = meta.story({
  name: "Stiffness & damping playground",
  parameters: {
    docs: {
      description: {
        story:
          "Pass a reactive accessor as `options` and `stiffness` / `damping` updates take effect on the current animation frame — no need to recreate the spring.",
      },
    },
  },
  render: () => {
    const [stiffness, setStiffness] = createSignal(0.15);
    const [damping, setDamping] = createSignal(0.8);
    const [target, setTarget] = createSignal(0);
    const [value, setValue, { isAnimating }] = createSpring(0, () => ({
      stiffness: stiffness(),
      damping: damping(),
    }));

    const toggle = () => {
      const next = target() === 0 ? 100 : 0;
      setTarget(next);
      setValue(next);
    };

    return (
      <Container>
        <ProgressBar value={value()} />

        <Card>
          <StatRow label="value" value={value().toFixed(2)} />
          <BoolRow label="isAnimating" value={isAnimating()} />
        </Card>

        <Section title="Physics options">
          <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
              <span style={{ "font-size": "0.82rem", color: "#64748b", "min-width": "70px" }}>
                stiffness
              </span>
              <input
                type="range"
                min="0.01"
                max="1"
                step="0.01"
                value={stiffness()}
                onInput={e => setStiffness(+e.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <span
                style={{
                  "font-size": "0.82rem",
                  "font-family": "monospace",
                  "min-width": "36px",
                  "text-align": "right",
                  "font-variant-numeric": "tabular-nums",
                }}
              >
                {stiffness().toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
              <span style={{ "font-size": "0.82rem", color: "#64748b", "min-width": "70px" }}>
                damping
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={damping()}
                onInput={e => setDamping(+e.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <span
                style={{
                  "font-size": "0.82rem",
                  "font-family": "monospace",
                  "min-width": "36px",
                  "text-align": "right",
                  "font-variant-numeric": "tabular-nums",
                }}
              >
                {damping().toFixed(2)}
              </span>
            </div>
          </div>
        </Section>

        <Button onClick={toggle} style={{ width: "100%" }}>
          Toggle 0 ↔ 100
        </Button>
      </Container>
    );
  },
});

export const ObjectSpring = meta.story({
  name: "Animated 2D position",
  parameters: {
    docs: {
      description: {
        story:
          "`createSpring` interpolates plain objects by animating each key independently. The shape (key set) must remain stable across `set()` calls.",
      },
    },
  },
  render: () => {
    const W = 240;
    const H = 160;
    const D = 18;

    const POSITIONS = [
      { label: "↖ TL", x: 8, y: 8 },
      { label: "↗ TR", x: W - D - 8, y: 8 },
      { label: "◎ C", x: (W - D) / 2, y: (H - D) / 2 },
      { label: "↙ BL", x: 8, y: H - D - 8 },
      { label: "↘ BR", x: W - D - 8, y: H - D - 8 },
    ];

    const [xy, setXY] = createSpring(
      { x: (W - D) / 2, y: (H - D) / 2 },
      { stiffness: 0.08, damping: 0.5 },
    );

    return (
      <Container>
        <div
          style={{
            position: "relative",
            width: `${W}px`,
            height: `${H}px`,
            background: "#f1f5f9",
            "border-radius": "8px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            "align-self": "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: `${xy().x}px`,
              top: `${xy().y}px`,
              width: `${D}px`,
              height: `${D}px`,
              "border-radius": "50%",
              background: "#6366f1",
              "box-shadow": "0 2px 8px rgba(99,102,241,0.4)",
              transition: "none",
            }}
          />
        </div>

        <Card>
          <StatRow label="x" value={xy().x.toFixed(1)} />
          <StatRow label="y" value={xy().y.toFixed(1)} />
        </Card>

        <ButtonRow>
          <For each={POSITIONS}>
            {p => (
              <Button
                variant="outline"
                onClick={() => setXY({ x: p.x, y: p.y })}
                style={{ flex: 1, "font-size": "0.78rem", padding: "0.3rem 0.4rem" }}
              >
                {p.label}
              </Button>
            )}
          </For>
        </ButtonRow>
      </Container>
    );
  },
});

export const DerivedTracking = meta.story({
  name: "Auto-tracking a signal",
  parameters: {
    docs: {
      description: {
        story:
          "`createDerivedSpring` wraps any accessor and returns a spring-animated follower — no manual `set()` needed. The raw signal jumps instantly; the spring lags behind with physics.",
      },
    },
  },
  render: () => {
    const [source, setSource] = createSignal(0);
    const spring = createDerivedSpring(source, { stiffness: 0.08, damping: 0.7 });

    return (
      <Container>
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
            <span
              style={{
                "font-size": "0.72rem",
                color: "#94a3b8",
                "text-transform": "uppercase",
                "letter-spacing": "0.06em",
              }}
            >
              source (jumps)
            </span>
            <ProgressBar value={source()} color="#94a3b8" />
          </div>
          <div style={{ display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
            <span
              style={{
                "font-size": "0.72rem",
                color: "#6366f1",
                "text-transform": "uppercase",
                "letter-spacing": "0.06em",
              }}
            >
              spring (follows)
            </span>
            <ProgressBar value={spring()} color="#6366f1" />
          </div>
        </div>

        <Card>
          <StatRow label="source" value={source()} />
          <StatRow label="spring" value={spring().toFixed(1)} />
        </Card>

        <ButtonRow>
          <For each={[0, 25, 50, 75, 100]}>
            {v => (
              <Button variant="outline" onClick={() => setSource(v)} style={{ flex: 1 }}>
                {v}
              </Button>
            )}
          </For>
        </ButtonRow>
      </Container>
    );
  },
});

export const SetterModes = meta.story({
  name: "Snap, spring, and soft launch",
  parameters: {
    docs: {
      description: {
        story:
          "Three springs receive the same target simultaneously via different setter options. `hard: true` snaps immediately; `soft: true` eases in before the spring takes full force; the default animates normally.",
      },
    },
  },
  render: () => {
    const [normal, setNormal] = createSpring(0, { stiffness: 0.12, damping: 0.7 });
    const [snapped, setSnapped] = createSpring(0, { stiffness: 0.12, damping: 0.7 });
    const [soft, setSoft] = createSpring(0, { stiffness: 0.12, damping: 0.7 });

    let toggled = false;
    const fire = () => {
      toggled = !toggled;
      const t = toggled ? 100 : 0;
      setNormal(t);
      setSnapped(t, { hard: true });
      setSoft(t, { soft: true });
    };

    const ROWS = [
      { label: "spring (default)", value: normal, color: "#6366f1" },
      { label: "hard: true", value: snapped, color: "#ef4444" },
      { label: "soft: true", value: soft, color: "#10b981" },
    ];

    return (
      <Container>
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.75rem" }}>
          <For each={ROWS}>
            {({ label, value, color }) => (
              <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
                <div
                  style={{
                    display: "flex",
                    "justify-content": "space-between",
                    "font-size": "0.8rem",
                  }}
                >
                  <span style={{ color: "#475569" }}>{label}</span>
                  <span
                    style={{
                      "font-family": "monospace",
                      color,
                      "font-weight": "600",
                      "font-variant-numeric": "tabular-nums",
                    }}
                  >
                    {value().toFixed(1)}
                  </span>
                </div>
                <ProgressBar value={value()} color={color} />
              </div>
            )}
          </For>
        </div>

        <Button onClick={fire} style={{ width: "100%" }}>
          Toggle all 0 ↔ 100
        </Button>
      </Container>
    );
  },
});
