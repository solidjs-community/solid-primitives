import { createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createOrientation, makeOrientation } from "@solid-primitives/orientation";
import readme from "../README.md?raw";
import { Button, Container } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Browser APIs/Orientation",
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

export const CreateOrientationStory = meta.story({
  name: "createOrientation",
  parameters: {
    docs: {
      description: {
        story:
          "`createOrientation()` returns reactive `angle` and `type` signals that update on every screen orientation change. On the server, both return static defaults (`angle: 0`, `type: 'portrait-primary'`). On mobile, rotate your device to see the values update live.",
      },
    },
  },
  render: () => {
    const { angle, type } = createOrientation();

    const typeColor = () => {
      switch (type()) {
        case "portrait-primary":
          return "#6366f1";
        case "portrait-secondary":
          return "#8b5cf6";
        case "landscape-primary":
          return "#10b981";
        case "landscape-secondary":
          return "#059669";
        default:
          return "#94a3b8";
      }
    };

    return (
      <Container>
        <h3 style={{ margin: 0 }}>createOrientation</h3>

        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            padding: "2rem",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "80px",
              border: `3px solid ${typeColor()}`,
              "border-radius": "10px",
              transition: "transform 0.4s ease, border-color 0.3s",
              transform: `rotate(${-angle()}deg)`,
              background: `${typeColor()}22`,
              position: "relative",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                background: typeColor(),
                "border-radius": "50%",
                margin: "6px auto 0",
                transition: "background 0.3s",
              }}
            />
          </div>
        </div>

        <div
          style={{
            padding: "0.75rem 1rem",
            background: "#f8fafc",
            "border-radius": "8px",
            border: "1px solid #e2e8f0",
            display: "flex",
            "flex-direction": "column",
            gap: "0.4rem",
            "font-size": "0.85rem",
          }}
        >
          <div style={{ display: "flex", "justify-content": "space-between" }}>
            <span style={{ color: "#64748b" }}>angle</span>
            <strong
              style={{
                "font-family": "monospace",
                "font-variant-numeric": "tabular-nums",
              }}
            >
              {angle()}°
            </strong>
          </div>
          <div style={{ display: "flex", "justify-content": "space-between" }}>
            <span style={{ color: "#64748b" }}>type</span>
            <strong style={{ "font-family": "monospace", color: typeColor() }}>{type()}</strong>
          </div>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Rotate your device or use browser DevTools device emulation (toggle device toolbar,
          then rotate) to trigger an orientation change. Uses{" "}
          <code>screen.orientation</code> when available, falling back to the{" "}
          <code>orientationchange</code> event on older browsers.
        </p>
      </Container>
    );
  },
});

export const MakeOrientationStory = meta.story({
  name: "makeOrientation (non-reactive)",
  parameters: {
    docs: {
      description: {
        story:
          "`makeOrientation(onChange)` is the non-reactive building block — no Solid lifecycle required. It attaches an orientation listener and returns a cleanup function. The callback receives a full `OrientationState` on every change but does not fire on mount. Suitable for use outside components or in plain JS modules.",
      },
    },
  },
  render: () => {
    type LogEntry = { angle: number; type: string; time: string };
    const [log, setLog] = createSignal<LogEntry[]>([]);
    const [listening, setListening] = createSignal(false);
    let cleanup: (() => void) | null = null;

    const start = () => {
      if (cleanup) return;
      cleanup = makeOrientation(state => {
        const time = new Date().toLocaleTimeString();
        setLog(prev => [{ ...state, time }, ...prev].slice(0, 6));
      });
      setListening(true);
    };

    const stop = () => {
      cleanup?.();
      cleanup = null;
      setListening(false);
    };

    return (
      <Container>
        <h3 style={{ margin: 0 }}>makeOrientation</h3>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button onClick={start} disabled={listening()} style={{ flex: 1 }}>
            Start listener
          </Button>
          <Button onClick={stop} disabled={!listening()} variant="outline" style={{ flex: 1 }}>
            Stop listener
          </Button>
        </div>

        <div
          style={{
            padding: "0.4rem 0.75rem",
            background: listening() ? "#dcfce7" : "#f1f5f9",
            "border-radius": "6px",
            "font-size": "0.8rem",
            color: listening() ? "#166534" : "#64748b",
            "text-align": "center",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          {listening() ? "Listening for orientation changes…" : "Not listening"}
        </div>

        <div
          style={{
            "min-height": "120px",
            padding: "0.75rem",
            background: "#f8fafc",
            "border-radius": "8px",
            border: "1px solid #e2e8f0",
            "font-family": "monospace",
            "font-size": "0.78rem",
          }}
        >
          {log().length === 0 ? (
            <span style={{ color: "#94a3b8" }}>No events yet — rotate your device</span>
          ) : (
            log().map(entry => (
              <div style={{ "margin-bottom": "0.3rem" }}>
                <span style={{ color: "#94a3b8" }}>{entry.time}</span>{" "}
                <strong style={{ color: "#1e293b" }}>{entry.angle}°</strong>{" "}
                <span style={{ color: "#6366f1" }}>{entry.type}</span>
              </div>
            ))
          )}
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Non-reactive — no Solid owner or <code>onCleanup</code> involved. Call the returned
          function to remove the listener at any time.
        </p>
      </Container>
    );
  },
});
