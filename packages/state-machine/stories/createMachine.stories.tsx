import { For, createSignal, onCleanup, onSettled, type Accessor } from "solid-js";
import type { JSX } from "@solidjs/web";
import preview from "../../../.storybook/preview.js";
import { createMachine } from "@solid-primitives/state-machine";
import readme from "../README.md?raw";
import {
  Button,
  ButtonRow,
  Container,
  Section,
  Separator,
  StatRow,
  colors,
  font,
  radii,
  inputStyle,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/State Machine",
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

// ── Story 1: Traffic Light ────────────────────────────────────────────────────

const LIGHTS = [
  { key: "red" as const, color: "#ef4444" },
  { key: "yellow" as const, color: "#f59e0b" },
  { key: "green" as const, color: "#22c55e" },
];

export const TrafficLight = meta.story({
  name: "Traffic light",
  parameters: {
    docs: {
      description: {
        story:
          "Typed `to` constraints enforce valid transitions at compile time. TypeScript rejects `state.to.green()` from `red` because `to: \"yellow\"` is the only allowed transition.",
      },
    },
  },
  render: () => {
    const state = createMachine<{
      red: { to: "yellow" };
      yellow: { to: "green" | "red" };
      green: { to: "red" };
    }>({
      initial: "red",
      states: {
        red: () => undefined,
        yellow: () => undefined,
        green: () => undefined,
      },
    });

    return (
      <Container width={240}>
        <div
          style={{
            background: "#0f172a",
            "border-radius": radii.lg,
            padding: "1rem 1.5rem",
            display: "flex",
            "flex-direction": "column",
            gap: "0.75rem",
            "align-items": "center",
            margin: "0 auto",
            width: "fit-content",
          }}
        >
          <For each={LIGHTS}>
            {l => (
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  "border-radius": "50%",
                  background: state.type === l.key ? l.color : "#1e293b",
                  "box-shadow":
                    state.type === l.key ? `0 0 16px ${l.color}99` : "none",
                  transition: "background 0.2s, box-shadow 0.2s",
                }}
              />
            )}
          </For>
        </div>

        <Section title="State">
          <StatRow label="current" value={state.type} />
        </Section>

        <ButtonRow>
          <Button
            onClick={() => {
              if (state.type === "red") state.to.yellow();
              else if (state.type === "yellow") state.to.green();
              else state.to.red();
            }}
          >
            Next
          </Button>
          <Button
            variant="outline"
            disabled={state.type === "red"}
            onClick={() => {
              if (state.type === "yellow" || state.type === "green")
                state.to.red();
            }}
          >
            Reset
          </Button>
        </ButtonRow>
      </Container>
    );
  },
});

// ── Story 2: Lifecycle Counter ────────────────────────────────────────────────

export const LifecycleCounter = meta.story({
  name: "Counter lifecycle",
  parameters: {
    docs: {
      description: {
        story:
          "Signals and cleanups created inside a state callback are owned by that state. The `count` signal and `setInterval` live inside `running` — transitioning to `idle` disposes them automatically via `onCleanup`.",
      },
    },
  },
  render: () => {
    const state = createMachine<{
      idle: { to: "running" };
      running: { value: { count: Accessor<number> }; to: "idle" };
    }>({
      initial: "idle",
      states: {
        idle: () => undefined,
        running() {
          const [count, setCount] = createSignal(0);
          const id = setInterval(() => setCount(c => c + 1), 100);
          onCleanup(() => clearInterval(id));
          return { count };
        },
      },
    });

    const count = () => {
      const s = state();
      return s.type === "running" ? s.value.count() : 0;
    };

    return (
      <Container width={260}>
        <div
          style={{
            "text-align": "center",
            "font-size": "2.5rem",
            "font-variant-numeric": "tabular-nums",
            "font-family": font.mono,
            "line-height": "1",
            padding: "0.5rem 0",
            color: state.type === "running" ? colors.primary : colors.muted,
            transition: "color 0.2s",
          }}
        >
          {count()}
        </div>

        <Section title="State">
          <StatRow label="type" value={state.type} />
        </Section>

        <ButtonRow>
          <Button
            disabled={state.type === "running"}
            onClick={() => {
              if (state.type === "idle") state.to.running();
            }}
          >
            Start
          </Button>
          <Button
            variant="outline"
            disabled={state.type === "idle"}
            onClick={() => {
              if (state.type === "running") state.to.idle();
            }}
          >
            Stop
          </Button>
        </ButtonRow>
      </Container>
    );
  },
});

// ── Story 3: JSX as State Value ───────────────────────────────────────────────

export const InlineEdit = meta.story({
  name: "JSX as state value",
  parameters: {
    docs: {
      description: {
        story:
          "`createMachine` works like a `<Switch>` component when state callbacks return JSX. Each state owns its DOM — transitioning disposes the old view and mounts the fresh one.",
      },
    },
  },
  render: () => {
    const [label, setLabel] = createSignal("Click Edit to change this text");

    // Forward references so state callbacks can trigger external transitions.
    // These are assigned after createMachine returns; closures capture the
    // binding, not the value, so they resolve correctly at call time.
    let toEdit!: () => void;
    let toRead!: () => void;

    const state = createMachine<{
      reading: { value: JSX.Element; to: "editing" };
      editing: { value: JSX.Element; to: "reading" };
    }>({
      initial: "reading",
      states: {
        reading() {
          return (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                "align-items": "center",
                flex: "1",
              }}
            >
              <span style={{ flex: "1", "font-size": font.sizeBase }}>
                {label()}
              </span>
              <Button
                onClick={() => toEdit()}
                style={{ padding: "0.25rem 0.75rem", "font-size": font.sizeSm }}
              >
                Edit
              </Button>
            </div>
          );
        },
        editing() {
          let el!: HTMLInputElement;
          const save = () => {
            setLabel(el.value.trim() || label());
            toRead();
          };
          return (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                "align-items": "center",
                flex: "1",
              }}
            >
              <input
                ref={e => {
                  el = e;
                  onSettled(() => e.focus());
                }}
                value={label()}
                onBlur={save}
                onKeyDown={e => {
                  if (e.key === "Enter") save();
                  if (e.key === "Escape") toRead();
                }}
                style={{ ...inputStyle, flex: "1" }}
              />
              <Button
                onClick={save}
                style={{ padding: "0.25rem 0.75rem", "font-size": font.sizeSm }}
              >
                Save
              </Button>
            </div>
          );
        },
      },
    });

    toEdit = () => {
      if (state.type === "reading") state.to.editing();
    };
    toRead = () => {
      if (state.type === "editing") state.to.reading();
    };

    return (
      <Container width={360}>
        <div
          style={{
            display: "flex",
            "align-items": "center",
            border: `1px solid ${colors.border}`,
            "border-radius": radii.md,
            padding: "0.5rem 0.75rem",
            "min-height": "42px",
            background: colors.surface,
          }}
        >
          {state.value}
        </div>
        <Separator />
        <StatRow label="mode" value={state.type} />
      </Container>
    );
  },
});
