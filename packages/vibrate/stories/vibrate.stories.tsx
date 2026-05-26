import { createSignal, createMemo, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createVibrate,
  createPulse,
  frequencyToPattern,
  isVibrationSupported,
  makeVibrate,
} from "@solid-primitives/vibrate";
import readme from "../README.md?raw";
import { makeContainer, Button, Alert } from "../../../.storybook/ui/index.js";

const container = makeContainer({ minWidth: 360 });

const StatusPill = (props: { active: boolean; label: string }) => (
  <div
    style={{
      display: "inline-flex",
      "align-items": "center",
      gap: "0.4rem",
      padding: "0.3rem 0.7rem",
      "border-radius": "999px",
      background: props.active ? "#dcfce7" : "#f1f5f9",
      color: props.active ? "#166534" : "#64748b",
      "font-size": "0.8rem",
      "font-weight": "600",
      transition: "background 0.2s, color 0.2s",
    }}
  >
    <div
      style={{
        width: "8px",
        height: "8px",
        "border-radius": "50%",
        background: props.active ? "#22c55e" : "#cbd5e1",
        transition: "background 0.2s",
      }}
    />
    {props.label}
  </div>
);

const meta = preview.meta({
  title: "Browser APIs/Vibrate",
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

export const ReactiveVibrate = meta.story({
  name: "createVibrate",
  parameters: {
    docs: {
      description: {
        story:
          "`createVibrate(pattern, options?)` returns `{ vibrating, start, stop, supported }`. The `vibrating` signal reflects the current state; `start` and `stop` control it. When `pattern` is a reactive accessor and changes while vibrating, the vibration restarts automatically with the new values.",
      },
    },
  },
  render: () => {
    const [patternStr, setPatternStr] = createSignal("200,100,200");
    const [withInterval, setWithInterval] = createSignal(false);

    const pattern = createMemo(() => {
      const parts = patternStr()
        .split(",")
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n) && n > 0);
      return parts.length === 1 ? parts[0]! : parts;
    });

    const { vibrating, start, stop, supported } = createVibrate(pattern, {
      get interval() {
        return withInterval() ? 800 : undefined;
      },
    });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createVibrate</h3>
        <Show when={!isVibrationSupported()}>
          <Alert variant="warning">
            Vibration API not available in this browser. Controls and state still work — haptics are no-ops on desktop and iOS.
          </Alert>
        </Show>

        <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
          <StatusPill active={vibrating()} label={vibrating() ? "Vibrating" : "Idle"} />
          <StatusPill active={supported} label={supported ? "API supported" : "Not supported"} />
        </div>

        <label style={{ "font-size": "0.85rem", color: "#64748b" }}>
          Pattern (ms, comma-separated)
          <input
            value={patternStr()}
            onInput={e => setPatternStr(e.currentTarget.value)}
            placeholder="e.g. 200,100,200"
            style={{
              display: "block",
              width: "100%",
              "margin-top": "0.35rem",
              padding: "0.45rem 0.65rem",
              border: "1px solid #e2e8f0",
              "border-radius": "6px",
              "font-size": "0.9rem",
              "box-sizing": "border-box",
            }}
          />
        </label>

        <label
          style={{
            display: "flex",
            "align-items": "center",
            gap: "0.5rem",
            "font-size": "0.85rem",
            color: "#64748b",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={withInterval()}
            onChange={e => setWithInterval(e.currentTarget.checked)}
          />
          Repeat every 800ms
        </label>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button onClick={start} disabled={vibrating()}>
            ▶ Start
          </Button>
          <Button onClick={stop} disabled={!vibrating()} color="#ef4444">
            ■ Stop
          </Button>
        </div>

        <div
          style={{
            "font-size": "0.8rem",
            color: "#64748b",
            padding: "0.5rem 0.75rem",
            background: "#f8fafc",
            "border-radius": "6px",
            "font-family": "monospace",
          }}
        >
          resolved pattern: [{Array.isArray(pattern()) ? (pattern() as number[]).join(", ") : pattern()}]
        </div>
      </div>
    );
  },
});

export const NonReactiveVibrate = meta.story({
  name: "makeVibrate (non-reactive)",
  parameters: {
    docs: {
      description: {
        story:
          "`makeVibrate(pattern, options?)` is the non-reactive building block — no Solid lifecycle dependency. It returns `[start, stop]` and is suitable for plain event listeners outside a reactive context. Both functions are no-ops when the Vibration API is unavailable.",
      },
    },
  },
  render: () => {
    const [vibrating, setVibrating] = createSignal(false);

    const [start, stop] = makeVibrate([100, 50, 100, 50, 300], { interval: 1000 });

    const handleStart = () => {
      start();
      setVibrating(true);
    };
    const handleStop = () => {
      stop();
      setVibrating(false);
    };

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>makeVibrate — non-reactive</h3>
        <Show when={!isVibrationSupported()}>
          <Alert variant="warning">
            Vibration API not available in this browser. Controls and state still work — haptics are no-ops on desktop and iOS.
          </Alert>
        </Show>

        <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
          <StatusPill active={vibrating()} label={vibrating() ? "Active" : "Stopped"} />
        </div>

        <div
          style={{
            padding: "0.75rem",
            "border-radius": "8px",
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            "font-size": "0.82rem",
            "font-family": "monospace",
            color: "#334155",
          }}
        >
          makeVibrate([100, 50, 100, 50, 300], {"{ interval: 1000 }"})
        </div>

        <p style={{ margin: 0, "font-size": "0.85rem", color: "#64748b" }}>
          Pattern: <strong>SOS-like tap</strong> repeating every second. Managed manually — no
          reactive owner, no <code>onCleanup</code>.
        </p>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button onClick={handleStart} disabled={vibrating()}>
            ▶ Start
          </Button>
          <Button onClick={handleStop} disabled={!vibrating()} color="#ef4444">
            ■ Stop
          </Button>
        </div>
      </div>
    );
  },
});

export const ReactivePulse = meta.story({
  name: "createPulse (frequency-based)",
  parameters: {
    docs: {
      description: {
        story:
          "`createPulse(hz, options?)` vibrates at a constant frequency rather than a fixed pattern. When `hz` is a reactive accessor and changes while pulsing, the rhythm updates immediately. The `dutyCycle` option controls the on/off ratio within each cycle (default 0.5).",
      },
    },
  },
  render: () => {
    const [hz, setHz] = createSignal(4);
    const [dutyCycle, setDutyCycle] = createSignal(0.5);

    const { pulsing, start, stop, supported } = createPulse(hz, {
      get dutyCycle() {
        return dutyCycle();
      },
    });

    const pattern = createMemo(() => frequencyToPattern(hz(), dutyCycle()));
    const periodMs = createMemo(() => Math.round(1000 / hz()));

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createPulse</h3>
        <Show when={!isVibrationSupported()}>
          <Alert variant="warning">
            Vibration API not available in this browser. Controls and state still work — haptics are no-ops on desktop and iOS.
          </Alert>
        </Show>

        <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
          <StatusPill active={pulsing()} label={pulsing() ? "Pulsing" : "Idle"} />
          <StatusPill active={supported} label={supported ? "API supported" : "Not supported"} />
        </div>

        <label style={{ "font-size": "0.85rem", color: "#64748b" }}>
          Frequency: <strong>{hz()} Hz</strong>
          <span style={{ "font-size": "0.78rem", "margin-left": "0.4rem" }}>
            ({periodMs()}ms period)
          </span>
          <input
            type="range"
            min="0.5"
            max="20"
            step="0.5"
            value={hz()}
            onInput={e => setHz(+e.currentTarget.value)}
            style={{ display: "block", width: "100%", "margin-top": "0.35rem" }}
          />
        </label>

        <label style={{ "font-size": "0.85rem", color: "#64748b" }}>
          Duty cycle: <strong>{Math.round(dutyCycle() * 100)}%</strong>
          <span style={{ "font-size": "0.78rem", "margin-left": "0.4rem" }}>
            (on: {pattern()[0]}ms / off: {pattern()[1]}ms)
          </span>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={dutyCycle()}
            onInput={e => setDutyCycle(+e.currentTarget.value)}
            style={{ display: "block", width: "100%", "margin-top": "0.35rem" }}
          />
        </label>

        <div style={{ display: "flex", "align-items": "center", gap: "0.5rem" }}>
          <div
            style={{
              flex: 1,
              height: "20px",
              "border-radius": "4px",
              overflow: "hidden",
              background: "#e2e8f0",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${dutyCycle() * 100}%`,
                background: pulsing() ? "#6366f1" : "#94a3b8",
                transition: "width 0.15s, background 0.2s",
              }}
            />
          </div>
          <span style={{ "font-size": "0.75rem", color: "#64748b", "white-space": "nowrap" }}>
            on/off ratio
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button onClick={start} disabled={pulsing()}>
            ▶ Pulse
          </Button>
          <Button onClick={stop} disabled={!pulsing()} color="#ef4444">
            ■ Stop
          </Button>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Drag sliders while pulsing — the rhythm updates immediately without stopping.
        </p>
      </div>
    );
  },
});

export const FrequencyCalculator = meta.story({
  name: "frequencyToPattern",
  parameters: {
    docs: {
      description: {
        story:
          "`frequencyToPattern(hz, dutyCycle?)` converts a frequency and duty cycle into a single-cycle `[onMs, offMs]` vibration pattern. Use it to preview what `makePulse` / `createPulse` will produce, or to build fully custom patterns from frequency inputs.",
      },
    },
  },
  render: () => {
    const [hz, setHz] = createSignal(2);
    const [dutyCycle, setDutyCycle] = createSignal(0.5);

    const pattern = createMemo(() => frequencyToPattern(hz(), dutyCycle()));
    const periodMs = createMemo(() => Math.round(1000 / hz()));
    const onPct = createMemo(() => (pattern()[0] / periodMs()) * 100);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>frequencyToPattern</h3>

        <label style={{ "font-size": "0.85rem", color: "#64748b" }}>
          Frequency: <strong>{hz()} Hz</strong>
          <input
            type="range"
            min="0.25"
            max="50"
            step="0.25"
            value={hz()}
            onInput={e => setHz(+e.currentTarget.value)}
            style={{ display: "block", width: "100%", "margin-top": "0.35rem" }}
          />
        </label>

        <label style={{ "font-size": "0.85rem", color: "#64748b" }}>
          Duty cycle: <strong>{Math.round(dutyCycle() * 100)}%</strong>
          <input
            type="range"
            min="0.05"
            max="0.95"
            step="0.05"
            value={dutyCycle()}
            onInput={e => setDutyCycle(+e.currentTarget.value)}
            style={{ display: "block", width: "100%", "margin-top": "0.35rem" }}
          />
        </label>

        <div
          style={{
            padding: "1rem",
            "border-radius": "8px",
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            "font-family": "monospace",
            "font-size": "1rem",
            color: "#1e293b",
            "text-align": "center",
          }}
        >
          frequencyToPattern({hz()}, {dutyCycle().toFixed(2)}) →{" "}
          <strong style={{ color: "#6366f1" }}>
            [{pattern()[0]}, {pattern()[1]}]
          </strong>
        </div>

        <div>
          <div style={{ "font-size": "0.8rem", color: "#64748b", "margin-bottom": "0.4rem" }}>
            Single cycle visualisation ({periodMs()}ms total)
          </div>
          <div
            style={{
              height: "32px",
              "border-radius": "6px",
              overflow: "hidden",
              display: "flex",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                width: `${onPct()}%`,
                background: "#6366f1",
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                "font-size": "0.72rem",
                color: "white",
                "font-weight": "600",
                overflow: "hidden",
                "white-space": "nowrap",
              }}
            >
              {pattern()[0]}ms
            </div>
            <div
              style={{
                flex: 1,
                background: "#e2e8f0",
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                "font-size": "0.72rem",
                color: "#64748b",
                "font-weight": "600",
                overflow: "hidden",
                "white-space": "nowrap",
              }}
            >
              {pattern()[1]}ms
            </div>
          </div>
          <div
            style={{
              display: "flex",
              "justify-content": "space-between",
              "font-size": "0.72rem",
              color: "#94a3b8",
              "margin-top": "0.2rem",
            }}
          >
            <span>■ on ({pattern()[0]}ms)</span>
            <span>□ off ({pattern()[1]}ms)</span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            "grid-template-columns": "1fr 1fr",
            gap: "0.5rem",
            "font-size": "0.82rem",
          }}
        >
          {(
            [
              ["Period", () => `${periodMs()}ms`],
              ["on duration", () => `${pattern()[0]}ms`],
              ["off duration", () => `${pattern()[1]}ms`],
              ["Effective Hz", () => `${(1000 / periodMs()).toFixed(2)}`],
            ] as const
          ).map(([label, val]) => (
            <div
              style={{
                padding: "0.4rem 0.65rem",
                background: "#f1f5f9",
                "border-radius": "5px",
                display: "flex",
                "flex-direction": "column",
                gap: "0.1rem",
              }}
            >
              <span style={{ color: "#64748b", "font-size": "0.75rem" }}>{label}</span>
              <strong style={{ "font-variant-numeric": "tabular-nums", "font-family": "monospace" }}>
                {val()}
              </strong>
            </div>
          ))}
        </div>
      </div>
    );
  },
});
