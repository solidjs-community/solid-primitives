import { createEffect, createSignal, For, onSettled } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createAnimate,
  makeScrollAnimation,
  makeViewAnimation,
  makeFlip,
  makeStagger,
  makeAnimationGroup,
  makeAnimate,
  makeMotionPath,
  makeSequence,
} from "@solid-primitives/animation";
import readme from "../README.md?raw";
import { Button, ButtonRow, Container, Section, StatRow } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Animation/Animation",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: { component: readme },
    },
  },
});

export default meta;


const ACCENT_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"] as const;

export const Animate = meta.story({
  name: "Animate an element",
  parameters: {
    docs: {
      description: {
        story:
          "`createAnimate` re-runs the animation whenever `target`, `keyframes`, or `options` change. " +
          "Tap a swatch to change the hue mid-animation — the keyframes accessor re-evaluates and the " +
          "animation restarts. The returned `Animation` accessor gives direct playback control.",
      },
    },
  },
  render: () => {
    let boxRef!: HTMLDivElement;
    const [target, setTarget] = createSignal<HTMLDivElement | null>(null);
    const [color, setColor] = createSignal<string>(ACCENT_COLORS[0]);
    const [playState, setPlayState] = createSignal("idle");

    const anim = createAnimate(
      target,
      () => [
        { transform: "scale(1)", background: color() },
        { transform: "scale(1.3)", background: color(), filter: "brightness(1.3)" },
        { transform: "scale(1)", background: color() },
      ],
      { duration: 1200, iterations: Infinity, easing: "ease-in-out" },
    );

    createEffect(
      () => anim(),
      a => {
        if (!a) {
          setPlayState("idle");
          return;
        }
        setPlayState(a.playState);
        const update = () => setPlayState(a.playState);
        a.addEventListener("play", update);
        a.addEventListener("pause", update);
        a.addEventListener("cancel", update);
        a.addEventListener("finish", update);
        return () => {
          a.removeEventListener("play", update);
          a.removeEventListener("pause", update);
          a.removeEventListener("cancel", update);
          a.removeEventListener("finish", update);
        };
      },
    );

    onSettled(() => { setTarget(boxRef); });

    return (
      <Container width={320}>
        <h3 style={{ margin: 0 }}>createAnimate</h3>

        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            height: "140px",
            background: "#f1f5f9",
            "border-radius": "12px",
          }}
        >
          <div
            ref={boxRef}
            style={{
              width: "64px",
              height: "64px",
              background: color(),
              "border-radius": "12px",
            }}
          />
        </div>

        <Section title="Color — changes keyframes reactively">
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <For each={[...ACCENT_COLORS]}>
              {c => (
                <button
                  onClick={() => setColor(c)}
                  style={{
                    width: "32px",
                    height: "32px",
                    background: c,
                    border: color() === c ? "3px solid #0f172a" : "3px solid transparent",
                    "border-radius": "8px",
                    cursor: "pointer",
                    padding: "0",
                  }}
                />
              )}
            </For>
          </div>
        </Section>

        <Section title="Playback">
          <ButtonRow>
            <Button onClick={() => anim()?.play()}>Play</Button>
            <Button onClick={() => anim()?.pause()} variant="secondary">
              Pause
            </Button>
            <Button onClick={() => anim()?.reverse()} variant="secondary">
              Reverse
            </Button>
            <Button onClick={() => anim()?.cancel()} variant="outline">
              Cancel
            </Button>
          </ButtonRow>
        </Section>

        <Section title="State">
          <StatRow label="playState" value={playState()} />
        </Section>
      </Container>
    );
  },
});


export const ScrollAnim = meta.story({
  name: "Scroll-driven progress bar",
  parameters: {
    docs: {
      description: {
        story:
          "`makeScrollAnimation` ties animation progress to scroll position via `ScrollTimeline` — " +
          "no scroll listeners or RAF loops needed. Scroll the list to see the progress bar fill. " +
          "Requires Chrome 115+.",
      },
    },
  },
  render: () => {
    let containerRef!: HTMLDivElement;
    let barRef!: HTMLDivElement;

    onSettled(() => {
      makeScrollAnimation(
        barRef,
        [
          { opacity: 0.2, transform: "scaleX(0)" },
          { opacity: 1, transform: "scaleX(1)" },
        ],
        { fill: "both", source: containerRef, axis: "block" },
      );
    });

    return (
      <Container width={360}>
        <h3 style={{ margin: 0 }}>makeScrollAnimation</h3>
        <p style={{ margin: 0, "font-size": "0.85rem", color: "#64748b" }}>
          Scroll the list — the bar fills as you go.
        </p>

        <div
          style={{
            height: "6px",
            background: "#e2e8f0",
            "border-radius": "9999px",
            overflow: "hidden",
          }}
        >
          <div
            ref={barRef}
            style={{
              height: "100%",
              background: "#6366f1",
              "transform-origin": "left",
            }}
          />
        </div>

        <div
          ref={containerRef}
          style={{
            height: "280px",
            "overflow-y": "scroll",
            background: "#f8fafc",
            "border-radius": "8px",
            border: "1px solid #e2e8f0",
            padding: "0.75rem",
            display: "flex",
            "flex-direction": "column",
            gap: "0.6rem",
          }}
        >
          <For each={Array.from({ length: 14 }, (_, i) => i + 1)}>
            {n => (
              <div
                style={{
                  padding: "0.65rem 0.9rem",
                  background: "white",
                  "border-radius": "6px",
                  border: "1px solid #e2e8f0",
                  "font-size": "0.85rem",
                  color: "#475569",
                  "flex-shrink": "0",
                }}
              >
                Item {n}
              </div>
            )}
          </For>
        </div>
      </Container>
    );
  },
});


const VIEW_CARDS = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta"];
const VIEW_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#10b981",
  "#3b82f6",
];

export const ViewAnim = meta.story({
  name: "Animate cards into view",
  parameters: {
    docs: {
      description: {
        story:
          "`makeViewAnimation` drives an animation with `ViewTimeline`, animating each element as it " +
          "enters the scroll port. Scroll the list to see cards fade and rise in. Requires Chrome 115+.",
      },
    },
  },
  render: () => {
    const itemRefs: HTMLDivElement[] = [];

    onSettled(() => {
      for (const el of itemRefs) {
        makeViewAnimation(
          el,
          [
            { opacity: 0, transform: "translateY(48px) scale(0.88)" },
            { opacity: 1, transform: "translateY(0) scale(1)" },
          ],
          { fill: "both", rangeStart: "entry 30%" },
        );
      }
    });

    return (
      <Container width={320}>
        <h3 style={{ margin: 0 }}>makeViewAnimation</h3>

        <div
          style={{
            height: "360px",
            "overflow-y": "scroll",
            display: "flex",
            "flex-direction": "column",
            gap: "0.6rem",
            padding: "0.5rem",
            background: "#f8fafc",
            "border-radius": "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <For each={VIEW_CARDS}>
            {(label, i) => (
              <div
                ref={el => (itemRefs[i()] = el)}
                style={{
                  padding: "1rem",
                  background: VIEW_COLORS[i()],
                  "border-radius": "8px",
                  color: "white",
                  "font-weight": "600",
                  "font-size": "0.9rem",
                  "flex-shrink": "0",
                }}
              >
                {label}
              </div>
            )}
          </For>
        </div>

        <p style={{ margin: 0, "font-size": "0.82rem", color: "#64748b" }}>
          Scroll to see each card animate in via ViewTimeline.
        </p>
      </Container>
    );
  },
});


export const Flip = meta.story({
  name: "FLIP a box between sides",
  parameters: {
    docs: {
      description: {
        story:
          "`makeFlip` records an element's position with `snapshot()`, then smoothly transitions from " +
          "the old layout geometry to the new one with `flip()`. Call `snapshot()` immediately before " +
          "the DOM change and `flip()` immediately after.",
      },
    },
  },
  render: () => {
    let boxRef!: HTMLDivElement;
    const [right, setRight] = createSignal(false);
    let flipController = { snapshot: () => {}, flip: () => undefined as Animation | undefined };

    onSettled(() => {
      flipController = makeFlip(boxRef, {
        duration: 480,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      });
    });

    const toggle = () => {
      flipController.snapshot();
      setRight(v => !v);
      flipController.flip();
    };

    return (
      <Container width={320}>
        <h3 style={{ margin: 0 }}>makeFlip</h3>

        <div
          style={{
            display: "flex",
            "justify-content": right() ? "flex-end" : "flex-start",
            "align-items": "center",
            height: "100px",
            background: "#f1f5f9",
            "border-radius": "12px",
            padding: "0 1rem",
            transition: "none",
          }}
        >
          <div
            ref={boxRef}
            style={{
              width: "56px",
              height: "56px",
              background: "#6366f1",
              "border-radius": "10px",
            }}
          />
        </div>

        <Button onClick={toggle}>Flip to {right() ? "left" : "right"}</Button>

        <p style={{ margin: 0, "font-size": "0.82rem", color: "#64748b" }}>
          The box jumps instantly in the DOM — FLIP animates back from the old position.
        </p>
      </Container>
    );
  },
});


const STAGGER_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f97316", "#10b981"];

export const Stagger = meta.story({
  name: "Stagger a grid of items",
  parameters: {
    docs: {
      description: {
        story:
          "`makeStagger` runs a WAAPI animation across a list of elements with an incremental per-element " +
          "delay. `stagger` adds offset on top of the base `delay`. Use `createStagger` for a reactive " +
          "wrapper that re-runs when the target list or keyframes change.",
      },
    },
  },
  render: () => {
    const itemRefs: HTMLDivElement[] = [];

    const animate = () =>
      makeStagger(
        itemRefs,
        [
          { opacity: 0, transform: "translateY(20px) scale(0.8)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 500, stagger: 80, fill: "both", easing: "ease-out" },
      );

    onSettled(() => { animate(); });

    return (
      <Container width={340}>
        <h3 style={{ margin: 0 }}>makeStagger</h3>

        <div
          style={{
            display: "grid",
            "grid-template-columns": "repeat(3, 1fr)",
            gap: "0.6rem",
          }}
        >
          <For each={STAGGER_COLORS}>
            {(c, i) => (
              <div
                ref={el => (itemRefs[i()] = el)}
                style={{
                  height: "64px",
                  background: c,
                  "border-radius": "10px",
                  opacity: "0",
                }}
              />
            )}
          </For>
        </div>

        <Button onClick={() => animate()}>Replay</Button>
      </Container>
    );
  },
});


const PANEL_LABELS = ["Header", "Body", "Footer"] as const;
const PANEL_COLORS = ["#6366f1", "#ec4899", "#10b981"] as const;

const ENTER_KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: "translateY(14px)" },
  { opacity: 1, transform: "none" },
];

export const AnimGroup = meta.story({
  name: "Control multiple animations as a group",
  parameters: {
    docs: {
      description: {
        story:
          "`makeAnimationGroup` forwards play / pause / cancel / reverse / finish to every animation in " +
          "a set simultaneously. Each panel has its own staggered entrance animation; the group buttons " +
          "control all three at once.",
      },
    },
  },
  render: () => {
    const panelRefs: HTMLDivElement[] = [];

    let group = makeAnimationGroup([]);

    const buildGroup = () => {
      group = makeAnimationGroup(
        panelRefs.map((el, i) =>
          makeAnimate(el, ENTER_KEYFRAMES, { duration: 600, delay: i * 140, fill: "both" }),
        ),
      );
    };

    onSettled(() => buildGroup());

    const replay = () => buildGroup();

    return (
      <Container width={320}>
        <h3 style={{ margin: 0 }}>makeAnimationGroup</h3>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
          <For each={[...PANEL_LABELS]}>
            {(label, i) => (
              <div
                ref={el => (panelRefs[i()] = el)}
                style={{
                  padding: "0.75rem 1rem",
                  background: PANEL_COLORS[i()],
                  color: "white",
                  "border-radius": "8px",
                  "font-weight": "600",
                  opacity: "0",
                }}
              >
                {label}
              </div>
            )}
          </For>
        </div>

        <Section title="Group controls">
          <ButtonRow>
            <Button onClick={replay}>Replay</Button>
            <Button onClick={() => group.pause()} variant="secondary">
              Pause
            </Button>
            <Button onClick={() => group.play()} variant="secondary">
              Play
            </Button>
            <Button onClick={() => group.reverse()} variant="secondary">
              Reverse
            </Button>
            <Button onClick={() => group.cancel()} variant="outline">
              Cancel
            </Button>
          </ButtonRow>
        </Section>
      </Container>
    );
  },
});


const PATHS = {
  Wave:   "M 20,80 C 80,20 140,140 200,80 S 320,20 380,80",
  Loop:   "M 200,140 C 280,140 340,80 340,40 S 280,-60 200,-60 S 60,0 60,40 S 120,140 200,140",
  Corner: "M 20,20 L 360,20 L 360,160",
} as const;

export const MotionPath = meta.story({
  name: "Animate along a motion path",
  parameters: {
    docs: {
      description: {
        story:
          "`makeMotionPath` sets `offset-path` on the element and animates `offsetDistance` from 0% to " +
          "100% via WAAPI. The element follows the path and optionally rotates to match the tangent. " +
          "Requires Chrome 79+ / Firefox 72+ / Safari 15.4+.",
      },
    },
  },
  render: () => {
    let dotRef!: HTMLDivElement;
    const [pathKey, setPathKey] = createSignal<keyof typeof PATHS>("Wave");
    let currentAnim: Animation | undefined;

    const play = (key: keyof typeof PATHS) => {
      currentAnim?.cancel();
      currentAnim = makeMotionPath(dotRef, PATHS[key], {
        duration: 1800,
        easing: "ease-in-out",
        iterations: Infinity,
        rotate: "auto",
      });
    };

    onSettled(() => { play("Wave"); });

    return (
      <Container width={448}>
        <h3 style={{ margin: 0 }}>makeMotionPath</h3>

        <div
          style={{
            position: "relative",
            height: "200px",
            background: "#f8fafc",
            "border-radius": "12px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <svg
            width="400"
            height="200"
            style={{ position: "absolute", inset: "0", overflow: "visible" }}
          >
            <path
              d={PATHS[pathKey()]}
              fill="none"
              stroke="#e2e8f0"
              stroke-width="2"
              stroke-dasharray="6 4"
            />
          </svg>
          <div
            ref={dotRef}
            style={{
              position: "absolute",
              width: "20px",
              height: "20px",
              background: "#6366f1",
              "border-radius": "50%",
              "box-shadow": "0 2px 8px rgba(99,102,241,0.5)",
            }}
          />
        </div>

        <Section title="Path">
          <ButtonRow>
            <For each={Object.keys(PATHS) as (keyof typeof PATHS)[]}>
              {key => (
                <Button
                  onClick={() => { setPathKey(key); play(key); }}
                  variant={pathKey() === key ? "primary" : "outline"}
                >
                  {key}
                </Button>
              )}
            </For>
          </ButtonRow>
        </Section>
      </Container>
    );
  },
});


const SEQ_STEPS = [
  { label: "Step 1 — fade in header", color: "#6366f1" },
  { label: "Step 2 — slide in body",  color: "#ec4899" },
  { label: "Step 3 — pop in footer",  color: "#10b981" },
] as const;

export const Sequence = meta.story({
  name: "Chain animations in sequence",
  parameters: {
    docs: {
      description: {
        story:
          "`makeSequence` chains animation factories so each runs only after the previous finishes. " +
          "Factories are called lazily — each animation is created just before it plays. " +
          "Calling `play()` again restarts from the beginning.",
      },
    },
  },
  render: () => {
    const stepRefs: HTMLDivElement[] = [];
    let seq: ReturnType<typeof makeSequence>;

    onSettled(() => {
      seq = makeSequence(
        SEQ_STEPS.map((_, i) => () =>
          makeAnimate(
            stepRefs[i]!,
            [
              { opacity: 0, transform: i === 2 ? "scale(0.7)" : `translateX(${i % 2 === 0 ? "-" : ""}24px)` },
              { opacity: 1, transform: i === 2 ? "scale(1)"   : "none" },
            ],
            { duration: 500, easing: "ease-out", fill: "both" },
          ),
        ),
      );
      seq.play();
    });

    return (
      <Container width={320}>
        <h3 style={{ margin: 0 }}>makeSequence</h3>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.6rem" }}>
          <For each={[...SEQ_STEPS]}>
            {(step, i) => (
              <div
                ref={el => (stepRefs[i()] = el)}
                style={{
                  padding: "0.85rem 1rem",
                  background: step.color,
                  color: "white",
                  "border-radius": "8px",
                  "font-size": "0.9rem",
                  "font-weight": "500",
                  opacity: "0",
                }}
              >
                {step.label}
              </div>
            )}
          </For>
        </div>

        <ButtonRow>
          <Button onClick={() => seq.play()}>Play sequence</Button>
          <Button onClick={() => seq.cancel()} variant="outline">Cancel</Button>
        </ButtonRow>
      </Container>
    );
  },
});
