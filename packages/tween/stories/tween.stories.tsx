import { createSignal, For } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createTween } from "@solid-primitives/tween";
import readme from "../README.md?raw";
import { container, StatRow, Track } from "./_helpers.js";

const meta = preview.meta({
  title: "Animation/Tween",
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

export const BasicTween = meta.story({
  name: "Smooth value transition (createTween)",
  parameters: {
    docs: {
      description: {
        story:
          "`createTween` returns a derived signal that smoothly interpolates from its previous value to the next whenever the target changes. The animation uses `requestAnimationFrame` and stops automatically once the target is reached.",
      },
    },
  },
  render: () => {
    const TARGETS = [0, 25, 50, 75, 100] as const;
    const [target, setTarget] = createSignal(50);
    const tweened = createTween(target, { duration: 600 });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createTween — 600 ms linear</h3>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            "border-radius": "8px",
            padding: "1rem",
            display: "flex",
            "flex-direction": "column",
            gap: "0.6rem",
          }}
        >
          <StatRow label="target" value={target()} />
          <StatRow label="tweened" value={Math.round(tweened())} />
        </div>

        <Track value={tweened()} />

        <div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
          <For each={TARGETS}>
            {v => (
              <button
                onClick={() => setTarget(v)}
                style={{
                  "font-weight": target() === v ? "700" : "400",
                  flex: 1,
                }}
              >
                {v}%
              </button>
            )}
          </For>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Click a target value — the bar slides smoothly using <code>requestAnimationFrame</code>.
        </p>
      </div>
    );
  },
});

const EASINGS: { label: string; fn: (t: number) => number; color: string }[] = [
  { label: "linear", fn: t => t, color: "#6366f1" },
  {
    label: "ease-in-out (cosine)",
    fn: t => 0.5 - Math.cos(Math.PI * t) / 2,
    color: "#10b981",
  },
  {
    label: "ease-in (quadratic)",
    fn: t => t * t,
    color: "#f59e0b",
  },
  {
    label: "ease-out (quadratic)",
    fn: t => t * (2 - t),
    color: "#ef4444",
  },
];

export const EasingComparison = meta.story({
  name: "Easing function comparison",
  parameters: {
    docs: {
      description: {
        story:
          "The `ease` option maps elapsed fraction `t ∈ [0,1]` to a progress value. Here four functions animate from the same starting point simultaneously — watch how each curve affects the motion.",
      },
    },
  },
  render: () => {
    const [target, setTarget] = createSignal(0);

    const tweens = EASINGS.map(({ fn }) =>
      createTween(target, { duration: 1200, ease: fn }),
    );

    const fire = (v: number) => setTarget(v);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>Easing comparison — 1200 ms</h3>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.75rem" }}>
          <For each={EASINGS}>
            {({ label, color }, i) => (
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
                    {Math.round(tweens[i()]!())}%
                  </span>
                </div>
                <Track value={tweens[i()]!()} color={color} />
              </div>
            )}
          </For>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => fire(target() === 0 ? 100 : 0)} style={{ flex: 1 }}>
            Toggle 0 ↔ 100
          </button>
          <button onClick={() => fire(Math.round(Math.random() * 100))} style={{ flex: 1 }}>
            Random value
          </button>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          All four bars start from the same value. Notice the acceleration profile of each curve.
        </p>
      </div>
    );
  },
});
