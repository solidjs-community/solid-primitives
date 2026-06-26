import { createEffect, createSignal, For, onSettled, Show } from "solid-js";
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
  createPresenceAnimation,
  createPresenceA,
  createPresenceB,
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

    onSettled(() => {
      setTarget(boxRef);
    });

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

    onSettled(() => {
      animate();
    });

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
  Wave: "M 20,80 C 80,20 140,140 200,80 S 320,20 380,80",
  Loop: "M 200,140 C 280,140 340,80 340,40 S 280,-60 200,-60 S 60,0 60,40 S 120,140 200,140",
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

    onSettled(() => {
      play("Wave");
    });

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
                  onClick={() => {
                    setPathKey(key);
                    play(key);
                  }}
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
  { label: "Step 2 — slide in body", color: "#ec4899" },
  { label: "Step 3 — pop in footer", color: "#10b981" },
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
        SEQ_STEPS.map(
          (_, i) => () =>
            makeAnimate(
              stepRefs[i]!,
              [
                {
                  opacity: 0,
                  transform: i === 2 ? "scale(0.7)" : `translateX(${i % 2 === 0 ? "-" : ""}24px)`,
                },
                { opacity: 1, transform: i === 2 ? "scale(1)" : "none" },
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
          <Button onClick={() => seq.cancel()} variant="outline">
            Cancel
          </Button>
        </ButtonRow>
      </Container>
    );
  },
});

const TOAST_PRESETS = [
  {
    title: "Changes saved",
    body: "Your edits have been saved successfully.",
    color: "#10b981",
    icon: "✓",
  },
  {
    title: "Upload failed",
    body: "The file could not be uploaded. Please try again.",
    color: "#f43f5e",
    icon: "✕",
  },
  {
    title: "Invite sent",
    body: "An invitation was sent to the address on file.",
    color: "#6366f1",
    icon: "→",
  },
  {
    title: "Low storage",
    body: "You are approaching your storage limit.",
    color: "#f59e0b",
    icon: "!",
  },
] as const;

export const PresenceToasts = meta.story({
  name: "Dismissible toast notifications",
  parameters: {
    docs: {
      description: {
        story:
          "Each toast is independently controlled by a `createPresenceAnimation` instance. " +
          "Clicking × sets that toast's `show` signal to false — the exit animation plays and the DOM " +
          "node is removed only after it completes. All toasts can exit simultaneously.",
      },
    },
  },
  render: () => {
    type ToastEntry = {
      id: number;
      title: string;
      body: string;
      color: string;
      icon: string;
      show: () => boolean;
      dismiss: () => void;
    };

    const [toasts, setToasts] = createSignal<ToastEntry[]>([]);
    let nextId = 0;
    let presetCursor = 0;

    const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

    const addToast = () => {
      const preset = TOAST_PRESETS[presetCursor++ % TOAST_PRESETS.length]!;
      const id = nextId++;
      const [show, setShow] = createSignal(true);
      setToasts(prev => [...prev, { id, ...preset, show, dismiss: () => setShow(false) }]);
    };

    return (
      <Container width={360}>
        <h3 style={{ margin: 0 }}>createPresenceAnimation</h3>

        <ButtonRow>
          <Button onClick={addToast}>Add toast</Button>
          <Button onClick={() => toasts().forEach(t => t.dismiss())} variant="outline">
            Dismiss all
          </Button>
        </ButtonRow>

        <div style={{ position: "relative", "min-height": "240px" }}>
          <div
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              right: "0",
              display: "flex",
              "flex-direction": "column",
              gap: "0.5rem",
            }}
          >
            <For each={toasts()}>
              {toast => {
                let el!: HTMLDivElement;

                const { isMounted } = createPresenceAnimation(() => el, toast.show, {
                  enter: [
                    { opacity: 0, transform: "translateX(110%) scale(0.92)" },
                    { opacity: 1, transform: "none" },
                  ],
                  exit: [
                    { opacity: 1, transform: "none" },
                    { opacity: 0, transform: "translateX(110%) scale(0.95)" },
                  ],
                  enterOptions: {
                    duration: 400,
                    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                    fill: "both",
                  },
                  exitOptions: { duration: 240, easing: "ease-in", fill: "forwards" },
                  initialEnter: true,
                });

                createEffect(
                  () => isMounted(),
                  mounted => {
                    if (!mounted) removeToast(toast.id);
                  },
                  { defer: true },
                );

                return (
                  <Show when={isMounted()}>
                    <div
                      ref={el}
                      style={{
                        display: "flex",
                        "align-items": "flex-start",
                        gap: "0.75rem",
                        padding: "0.85rem 1rem",
                        background: "white",
                        "border-radius": "10px",
                        "box-shadow": "0 4px 20px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)",
                        "border-left": `4px solid ${toast.color}`,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          "border-radius": "50%",
                          background: toast.color,
                          color: "white",
                          display: "flex",
                          "align-items": "center",
                          "justify-content": "center",
                          "font-size": "0.75rem",
                          "font-weight": "700",
                          "flex-shrink": "0",
                        }}
                      >
                        {toast.icon}
                      </div>
                      <div style={{ flex: "1", "min-width": "0" }}>
                        <div
                          style={{
                            "font-weight": "600",
                            "font-size": "0.875rem",
                            color: "#0f172a",
                            "margin-bottom": "0.15rem",
                          }}
                        >
                          {toast.title}
                        </div>
                        <div
                          style={{ "font-size": "0.8rem", color: "#64748b", "line-height": "1.45" }}
                        >
                          {toast.body}
                        </div>
                      </div>
                      <button
                        onClick={toast.dismiss}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#94a3b8",
                          cursor: "pointer",
                          padding: "0",
                          "font-size": "1.1rem",
                          "line-height": "1",
                          "flex-shrink": "0",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </Show>
                );
              }}
            </For>
          </div>
        </div>
      </Container>
    );
  },
});

const MODAL_CARDS = [
  {
    title: "Save changes?",
    body: "Your unsaved edits will be lost if you close without saving.",
    confirm: "Save",
    color: "#6366f1",
  },
  {
    title: "Delete item?",
    body: "This action cannot be undone. The item will be permanently removed.",
    confirm: "Delete",
    color: "#f43f5e",
  },
  {
    title: "Send invite?",
    body: "An email invitation will be sent to the address you entered.",
    confirm: "Send",
    color: "#10b981",
  },
] as const;

export const PresenceModal = meta.story({
  name: "Animate a modal dialog",
  parameters: {
    docs: {
      description: {
        story:
          "A backdrop + modal pair, each with independent `createPresenceAnimation` instances. " +
          "The modal scales and fades in while the backdrop fades — both exit fully before the DOM is cleaned up.",
      },
    },
  },
  render: () => {
    const [cardIndex, setCardIndex] = createSignal(0);
    const [show, setShow] = createSignal(false);
    let backdropEl!: HTMLDivElement;
    let modalEl!: HTMLDivElement;

    const { isMounted: backdropMounted } = createPresenceAnimation(() => backdropEl, show, {
      enter: [{ opacity: 0 }, { opacity: 1 }],
      enterOptions: { duration: 200, easing: "ease-out", fill: "both" },
      exitOptions: { duration: 180, easing: "ease-in", fill: "forwards" },
    });

    const { isMounted: modalMounted } = createPresenceAnimation(() => modalEl, show, {
      enter: [
        { opacity: 0, transform: "scale(0.88) translateY(16px)" },
        { opacity: 1, transform: "none" },
      ],
      exit: [
        { opacity: 1, transform: "none" },
        { opacity: 0, transform: "scale(0.92) translateY(8px)" },
      ],
      enterOptions: { duration: 320, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", fill: "both" },
      exitOptions: { duration: 180, easing: "ease-in", fill: "forwards" },
    });

    const card = () => MODAL_CARDS[cardIndex()];

    return (
      <Container width={360}>
        <h3 style={{ margin: 0 }}>createPresenceAnimation</h3>

        <Section title="Open a dialog">
          <ButtonRow>
            <For each={[...MODAL_CARDS]}>
              {(c, i) => (
                <Button
                  onClick={() => {
                    setCardIndex(i());
                    setShow(true);
                  }}
                  variant={cardIndex() === i() ? "primary" : "outline"}
                >
                  {c.title.split(" ")[0]}
                </Button>
              )}
            </For>
          </ButtonRow>
        </Section>

        {/* Backdrop + modal share one Show so the modal never needs transform-based centering */}
        <Show when={backdropMounted()}>
          <div
            ref={backdropEl}
            onClick={() => setShow(false)}
            style={{
              position: "fixed",
              inset: "0",
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              "z-index": "50",
            }}
          >
            <Show when={modalMounted()}>
              <div
                ref={modalEl}
                onClick={e => e.stopPropagation()}
                style={{
                  width: "300px",
                  background: "white",
                  "border-radius": "14px",
                  padding: "1.5rem",
                  "box-shadow": "0 20px 60px rgba(0,0,0,0.25)",
                  "z-index": "51",
                  display: "flex",
                  "flex-direction": "column",
                  gap: "0.75rem",
                }}
              >
                <h4 style={{ margin: 0, color: "#0f172a" }}>{card().title}</h4>
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    "font-size": "0.875rem",
                    "line-height": "1.5",
                  }}
                >
                  {card().body}
                </p>
                <ButtonRow>
                  <Button onClick={() => setShow(false)} style={{ background: card().color }}>
                    {card().confirm}
                  </Button>
                  <Button onClick={() => setShow(false)} variant="outline">
                    Cancel
                  </Button>
                </ButtonRow>
              </div>
            </Show>
          </div>
        </Show>
      </Container>
    );
  },
});

const TABS = [
  { label: "Profile", color: "#6366f1", body: "Manage your name, avatar, and contact details." },
  {
    label: "Security",
    color: "#f43f5e",
    body: "Update your password and two-factor authentication settings.",
  },
  {
    label: "Billing",
    color: "#10b981",
    body: "View invoices, update your payment method, or cancel your plan.",
  },
] as const;

export const PresenceTabs = meta.story({
  name: "Crossfade between tab panels",
  parameters: {
    docs: {
      description: {
        story:
          "Each tab panel is a separate `createPresenceAnimation` instance keyed to whether it is active. " +
          "Switching tabs plays the outgoing panel's exit animation before removing it, then plays the " +
          "incoming panel's enter animation.",
      },
    },
  },
  render: () => {
    const [active, setActive] = createSignal(0);

    return (
      <Container width={340}>
        <h3 style={{ margin: 0 }}>createPresenceAnimation — tabs</h3>

        <div style={{ display: "flex", gap: "0.4rem" }}>
          <For each={[...TABS]}>
            {(tab, i) => (
              <button
                onClick={() => setActive(i())}
                style={{
                  flex: "1",
                  padding: "0.5rem",
                  background: active() === i() ? tab.color : "#f1f5f9",
                  color: active() === i() ? "white" : "#64748b",
                  border: "none",
                  "border-radius": "8px",
                  "font-weight": "600",
                  "font-size": "0.82rem",
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {tab.label}
              </button>
            )}
          </For>
        </div>

        <div style={{ position: "relative", "min-height": "80px" }}>
          <For each={[...TABS]}>
            {(tab, i) => {
              let el!: HTMLDivElement;
              const { isMounted } = createPresenceAnimation(
                () => el,
                () => active() === i(),
                {
                  enter: [
                    { opacity: 0, transform: "translateX(10px)" },
                    { opacity: 1, transform: "none" },
                  ],
                  exit: [
                    { opacity: 1, transform: "none" },
                    { opacity: 0, transform: "translateX(-10px)" },
                  ],
                  enterOptions: { duration: 200, easing: "ease-out" },
                  exitOptions: { duration: 150, easing: "ease-in" },
                },
              );

              return (
                <Show when={isMounted()}>
                  <div
                    ref={el}
                    style={{
                      position: "absolute",
                      inset: "0",
                      padding: "1rem",
                      background: tab.color,
                      color: "white",
                      "border-radius": "10px",
                      "font-size": "0.9rem",
                      "line-height": "1.5",
                    }}
                  >
                    <strong>{tab.label}</strong> — {tab.body}
                  </div>
                </Show>
              );
            }}
          </For>
        </div>
      </Container>
    );
  },
});

// ─── createPresenceA ──────────────────────────────────────────────────────────

// A self-contained interactive widget defined outside any reactive scope so
// its identity is stable across renders.
const InteractiveCard = (props: {
  ref: (el: HTMLDivElement) => void;
  isExiting: () => boolean;
}) => {
  const [count, setCount] = createSignal(0);
  const [note, setNote] = createSignal("");

  return (
    <div
      ref={props.ref}
      style={{
        padding: "1.25rem",
        background: props.isExiting() ? "#fffbeb" : "#f0f9ff",
        border: `2px solid ${props.isExiting() ? "#f59e0b" : "#0ea5e9"}`,
        "border-radius": "12px",
        display: "flex",
        "flex-direction": "column",
        gap: "0.85rem",
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      <div
        style={{
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center",
        }}
      >
        <span
          style={{
            "font-weight": "700",
            "font-size": "0.8rem",
            "text-transform": "uppercase",
            "letter-spacing": "0.06em",
            color: props.isExiting() ? "#d97706" : "#0369a1",
          }}
        >
          {props.isExiting() ? "Exiting — signals still live" : "Mounted"}
        </span>
      </div>

      {/* Counter — signal lives inside this component */}
      <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
        <button
          onClick={() => setCount(v => v - 1)}
          style={{
            width: "36px",
            height: "36px",
            "border-radius": "50%",
            border: "none",
            background: "#e0f2fe",
            color: "#0369a1",
            "font-size": "1.2rem",
            cursor: "pointer",
          }}
        >
          −
        </button>
        <span
          style={{
            "font-size": "1.6rem",
            "font-weight": "700",
            "font-variant-numeric": "tabular-nums",
            "min-width": "3ch",
            "text-align": "center",
            color: "#0f172a",
          }}
        >
          {count()}
        </span>
        <button
          onClick={() => setCount(v => v + 1)}
          style={{
            width: "36px",
            height: "36px",
            "border-radius": "50%",
            border: "none",
            background: "#e0f2fe",
            color: "#0369a1",
            "font-size": "1.2rem",
            cursor: "pointer",
          }}
        >
          +
        </button>
        <span style={{ "font-size": "0.8rem", color: "#64748b" }}>counter signal</span>
      </div>

      {/* Text input — local state lives inside this component */}
      <input
        type="text"
        value={note()}
        onInput={e => setNote(e.currentTarget.value)}
        placeholder="Type something…"
        style={{
          padding: "0.45rem 0.75rem",
          border: "1px solid #bae6fd",
          "border-radius": "6px",
          "font-size": "0.875rem",
          background: "white",
          outline: "none",
        }}
      />
      <span style={{ "font-size": "0.78rem", color: "#64748b" }}>
        input state: <strong>"{note()}"</strong>
      </span>
    </div>
  );
};

export const PresenceAStory = meta.story({
  name: "createPresenceA — signals alive during exit",
  parameters: {
    docs: {
      description: {
        story:
          "`createPresenceA` extends `createPresenceAnimation` with an `isExiting` accessor and makes the " +
          "signal-survival guarantee explicit. The exit animation runs for **2 seconds** so you can " +
          "interact with the counter and input while the card is animating out — both keep working " +
          "because the component owner is only disposed after `isMounted` goes `false`, which happens " +
          "only after the WAAPI `.finish` event fires.",
      },
    },
  },
  render: () => {
    const [show, setShow] = createSignal(true);
    let el!: HTMLDivElement;

    const { isMounted, isExiting } = createPresenceA(() => el, show, {
      enter: [
        { opacity: 0, transform: "translateY(12px) scale(0.94)" },
        { opacity: 1, transform: "none" },
      ],
      exit: [
        { opacity: 1, transform: "none" },
        { opacity: 0, transform: "translateY(12px) scale(0.94)" },
      ],
      enterOptions: { duration: 350, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", fill: "both" },
      // Slow exit so you can observe interactivity during animation
      exitOptions: { duration: 1250, easing: "ease-in", fill: "forwards" },
      initialEnter: true,
    });

    return (
      <Container width={340}>
        <h3 style={{ margin: 0 }}>createPresenceA</h3>
        <p style={{ margin: 0, "font-size": "0.85rem", color: "#64748b" }}>
          Click +/− or type while the card is exiting (2 s animation) — signals keep working.
        </p>

        <Show when={isMounted()}>
          <InteractiveCard ref={el} isExiting={isExiting} />
        </Show>

        <div
          style={{
            padding: "0.5rem 0.9rem",
            background: "#f8fafc",
            "border-radius": "8px",
            border: "1px solid #e2e8f0",
            "font-size": "0.82rem",
            "font-family": '"Geist Mono", monospace',
            display: "flex",
            gap: "1.5rem",
          }}
        >
          <span>
            isMounted:{" "}
            <strong style={{ color: isMounted() ? "#16a34a" : "#dc2626" }}>
              {String(isMounted())}
            </strong>
          </span>
          <span>
            isExiting:{" "}
            <strong style={{ color: isExiting() ? "#d97706" : "#94a3b8" }}>
              {String(isExiting())}
            </strong>
          </span>
        </div>

        <ButtonRow>
          <Button onClick={() => setShow(v => !v)} variant={show() ? "outline" : "primary"}>
            {show() ? "Hide (2 s exit)" : "Show"}
          </Button>
        </ButtonRow>
      </Container>
    );
  },
});

// ─── createPresenceB ──────────────────────────────────────────────────────────

const SLIDES = [
  { id: "alpha", label: "Alpha", color: "#6366f1", emoji: "🔮" },
  { id: "beta", label: "Beta", color: "#ec4899", emoji: "🌸" },
  { id: "gamma", label: "Gamma", color: "#10b981", emoji: "🌿" },
] as const;

type Slide = (typeof SLIDES)[number];

const SLIDE_ANIM_OPTIONS = {
  enter: [
    { opacity: 0, transform: "translateX(24px) scale(0.95)" },
    { opacity: 1, transform: "none" },
  ],
  exit: [
    { opacity: 1, transform: "none" },
    { opacity: 0, transform: "translateX(-24px) scale(0.95)" },
  ],
  enterOptions: {
    duration: 280,
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    fill: "both" as FillMode,
  },
  // Slow exit so you can observe the counter value persisting while animating out
  exitOptions: { duration: 400, easing: "ease-in", fill: "forwards" as FillMode },
  initialEnter: true,
};

// Defined at module level so each instance has a stable, independent reactive scope.
const SlideCardB = (props: { slide: Slide; active: () => Slide }) => {
  let el!: HTMLDivElement;
  const [count, setCount] = createSignal(0);

  const { gate, isExiting } = createPresenceB(
    () => el,
    () => props.active() === props.slide,
    SLIDE_ANIM_OPTIONS,
  );

  const s = props.slide;

  return (
    <Show when={gate()}>
      <div
        ref={el}
        style={{
          position: "absolute",
          inset: "0",
          padding: "1.25rem",
          background: isExiting() ? `${s.color}33` : `${s.color}18`,
          border: `2px solid ${s.color}`,
          "border-radius": "12px",
          display: "flex",
          "flex-direction": "column",
          gap: "0.75rem",
          transition: "background 0.3s",
        }}
      >
        <div style={{ display: "flex", "align-items": "center", gap: "0.5rem" }}>
          <span style={{ "font-size": "1.4rem" }}>{s.emoji}</span>
          <strong style={{ color: s.color, "font-size": "1rem" }}>{s.label}</strong>
          <Show when={isExiting()}>
            <span
              style={{
                "margin-left": "auto",
                "font-size": "0.75rem",
                color: s.color,
                opacity: "0.8",
              }}
            >
              exiting…
            </span>
          </Show>
        </div>

        <div style={{ display: "flex", "align-items": "center", gap: "0.6rem" }}>
          <button
            onClick={() => setCount(v => v - 1)}
            style={{
              width: "30px",
              height: "30px",
              "border-radius": "50%",
              border: "none",
              background: `${s.color}22`,
              color: s.color,
              "font-size": "1rem",
              cursor: "pointer",
            }}
          >
            −
          </button>
          <span
            style={{
              "font-size": "1.4rem",
              "font-weight": "700",
              "min-width": "2.5ch",
              "text-align": "center",
              color: "#0f172a",
              "font-variant-numeric": "tabular-nums",
            }}
          >
            {count()}
          </span>
          <button
            onClick={() => setCount(v => v + 1)}
            style={{
              width: "30px",
              height: "30px",
              "border-radius": "50%",
              border: "none",
              background: `${s.color}22`,
              color: s.color,
              "font-size": "1rem",
              cursor: "pointer",
            }}
          >
            +
          </button>
          <span style={{ "font-size": "0.78rem", color: "#64748b" }}>{s.label}'s counter</span>
        </div>
      </div>
    </Show>
  );
};

export const PresenceBStory = meta.story({
  name: "createPresenceB — deferred disposal via async gate",
  parameters: {
    docs: {
      description: {
        story:
          "`createPresenceB` uses Solid 2.0's built-in deferred-disposal mechanism. When `show` goes " +
          "false, the `gate` memo returns a `Promise` instead of `false`. Returning a Promise causes " +
          "`handleAsync` to throw `NotReadyError`, putting `gate` into `STATUS_PENDING`. " +
          "`notifyStatus` propagates to Show's internal `createRenderEffect` via `queuePendingNode` " +
          "(not the dirty heap), so Show never recomputes and the component owner is **not disposed**. " +
          "When the WAAPI animation finishes the Promise resolves, `asyncWrite` makes Show recompute, " +
          "and the component is finally removed. Each slide below has its own `count` signal — " +
          "increment it, switch slides, and observe the old value during the 1.4 s exit.",
      },
    },
  },
  render: () => {
    const [active, setActive] = createSignal<Slide>(SLIDES[0]);

    return (
      <Container width={360}>
        <h3 style={{ margin: 0 }}>createPresenceB</h3>
        <p style={{ margin: 0, "font-size": "0.85rem", color: "#64748b" }}>
          Increment a counter, then switch slides. The old slide's count persists during its 1.4 s
          exit — the component owner is deferred via an async <code>gate</code> memo.
        </p>

        <div style={{ display: "flex", gap: "0.4rem" }}>
          <For each={[...SLIDES]}>
            {slide => (
              <button
                onClick={() => setActive(slide)}
                style={{
                  flex: "1",
                  padding: "0.5rem",
                  background: active() === slide ? slide.color : "#f1f5f9",
                  color: active() === slide ? "white" : "#64748b",
                  border: "none",
                  "border-radius": "8px",
                  "font-weight": "600",
                  "font-size": "0.82rem",
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {slide.emoji} {slide.label}
              </button>
            )}
          </For>
        </div>

        {/* Stacked so entering and exiting slides overlap during crossfade */}
        <div style={{ position: "relative", height: "130px" }}>
          <For each={[...SLIDES]}>{slide => <SlideCardB slide={slide} active={active} />}</For>
        </div>

        <div
          style={{
            "font-size": "0.8rem",
            color: "#94a3b8",
            "font-family": '"Geist Mono", monospace',
            "padding-top": "0.25rem",
          }}
        >
          active: <strong style={{ color: "#0f172a" }}>{active().label}</strong>
        </div>
      </Container>
    );
  },
});
