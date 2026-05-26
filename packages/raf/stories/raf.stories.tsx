import { createSignal, For } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createRAF, targetFPS, createMs } from "@solid-primitives/raf";
import readme from "../README.md?raw";
import { makeContainer, Button } from "../../../.storybook/ui/index.js";

const container = makeContainer(360);

const meta = preview.meta({
  title: "Animation/RAF",
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

export const BasicRAF = meta.story({
  name: "createRAF — animation loop",
  parameters: {
    docs: {
      description: {
        story:
          "`createRAF(callback)` returns `[running, start, stop]`. The loop calls your callback on every animation frame and disposes automatically on cleanup. Use `running()` to reflect state in the UI and adjust animations based on the timestamp.",
      },
    },
  },
  render: () => {
    const [angle, setAngle] = createSignal(0);
    const [frameCount, setFrameCount] = createSignal(0);

    const [running, start, stop] = createRAF(() => {
      setAngle(a => (a + 1) % 360);
      setFrameCount(n => n + 1);
    });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createRAF</h3>

        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            height: "120px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              background: running() ? "#6366f1" : "#e2e8f0",
              "border-radius": "10px",
              transition: "background 0.2s",
              transform: `rotate(${angle()}deg)`,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button onClick={start} disabled={running()} style={{ flex: 1 }}>
            ▶ Start
          </Button>
          <Button onClick={stop} disabled={!running()} variant="outline" style={{ flex: 1 }}>
            ■ Stop
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "font-size": "0.82rem",
            padding: "0.5rem 0.75rem",
            background: "#f8fafc",
            "border-radius": "6px",
            "font-family": "monospace",
          }}
        >
          <span>
            running:{" "}
            <strong style={{ color: running() ? "#16a34a" : "#94a3b8" }}>
              {String(running())}
            </strong>
          </span>
          <span>
            frames: <strong style={{ "font-variant-numeric": "tabular-nums" }}>{frameCount()}</strong>
          </span>
          <span>
            angle: <strong style={{ "font-variant-numeric": "tabular-nums" }}>{angle()}°</strong>
          </span>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          On a 60 Hz display the callback fires ~60 times per second. The loop disposes
          automatically when the story unmounts — no manual cleanup needed.
        </p>
      </div>
    );
  },
});

export const TargetFPSStory = meta.story({
  name: "targetFPS — frame rate limiter",
  parameters: {
    docs: {
      description: {
        story:
          "`targetFPS(callback, fps)` wraps a RAF callback to cap execution at a given frame rate by skipping frames above the limit. The `fps` argument can be a reactive accessor, so you can change the cap at runtime without restarting the loop.",
      },
    },
  },
  render: () => {
    const FPS_OPTIONS = [5, 10, 15, 30, 60] as const;
    const [fps, setFps] = createSignal<(typeof FPS_OPTIONS)[number]>(30);
    const [callbackCount, setCallbackCount] = createSignal(0);
    const [measuredFps, setMeasuredFps] = createSignal(0);

    let frameTimes: number[] = [];

    const [running, start, stop] = createRAF(
      targetFPS(ts => {
        setCallbackCount(n => n + 1);
        frameTimes.push(ts);
        if (frameTimes.length > 60) frameTimes.shift();
        if (frameTimes.length >= 2) {
          const span = frameTimes.at(-1)! - frameTimes[0]!;
          setMeasuredFps(Math.round(((frameTimes.length - 1) / span) * 1000));
        }
      }, fps),
    );

    const changeTarget = (f: (typeof FPS_OPTIONS)[number]) => {
      frameTimes = [];
      setMeasuredFps(0);
      setFps(f);
    };

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>targetFPS</h3>

        <div style={{ display: "flex", gap: "0.4rem", "flex-wrap": "wrap" }}>
          <For each={[...FPS_OPTIONS]}>
            {f => (
              <Button
                onClick={() => changeTarget(f)}
                variant={fps() === f ? "primary" : "outline"}
                style={{ flex: 1 }}
              >
                {f} fps
              </Button>
            )}
          </For>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button onClick={start} disabled={running()} style={{ flex: 1 }}>
            ▶ Start
          </Button>
          <Button onClick={stop} disabled={!running()} variant="outline" style={{ flex: 1 }}>
            ■ Stop
          </Button>
        </div>

        <div
          style={{
            padding: "0.75rem 1rem",
            background: "#f8fafc",
            "border-radius": "6px",
            border: "1px solid #e2e8f0",
            display: "flex",
            "flex-direction": "column",
            gap: "0.35rem",
            "font-size": "0.85rem",
          }}
        >
          <div style={{ display: "flex", "justify-content": "space-between" }}>
            <span style={{ color: "#64748b" }}>target fps</span>
            <strong style={{ "font-family": "monospace" }}>{fps()}</strong>
          </div>
          <div style={{ display: "flex", "justify-content": "space-between" }}>
            <span style={{ color: "#64748b" }}>measured fps</span>
            <strong style={{ "font-family": "monospace", "font-variant-numeric": "tabular-nums" }}>
              {running() ? measuredFps() : "—"}
            </strong>
          </div>
          <div style={{ display: "flex", "justify-content": "space-between" }}>
            <span style={{ color: "#64748b" }}>total callbacks</span>
            <strong style={{ "font-family": "monospace", "font-variant-numeric": "tabular-nums" }}>
              {callbackCount()}
            </strong>
          </div>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Switch targets while running — the rate adjusts immediately. Limiting works by
          skipping frames, so individual frame durations may be uneven at low targets.
        </p>
      </div>
    );
  },
});

export const CreateMsStory = meta.story({
  name: "createMs — millisecond counter",
  parameters: {
    docs: {
      description: {
        story:
          "`createMs(fps, limit?)` returns a signal counting elapsed milliseconds at the given frame rate, with `reset()`, `running()`, `start()`, and `stop()` methods. Pass a `limit` to auto-reset the counter when it reaches the threshold — useful for looping animations.",
      },
    },
  },
  render: () => {
    const LIMIT = 3000;
    const [fps, setFps] = createSignal(60);
    const ms = createMs(fps, LIMIT);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createMs</h3>

        <div
          style={{
            height: "12px",
            background: "#f1f5f9",
            "border-radius": "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, (ms() / LIMIT) * 100)}%`,
              background: "#6366f1",
              transition: "none",
            }}
          />
        </div>

        <div
          style={{
            "font-family": "monospace",
            "font-size": "2.2rem",
            "text-align": "center",
            "font-variant-numeric": "tabular-nums",
            color: "#1e293b",
          }}
        >
          {ms()} ms
        </div>

        <label style={{ "font-size": "0.85rem", color: "#64748b" }}>
          Frame rate: <strong>{fps()} fps</strong>
          <input
            type="range"
            min="1"
            max="120"
            value={fps()}
            onInput={e => {
              setFps(+e.currentTarget.value);
              ms.reset();
            }}
            style={{ display: "block", width: "100%", "margin-top": "0.35rem" }}
          />
        </label>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button onClick={() => ms.start()} disabled={ms.running()} style={{ flex: 1 }}>
            ▶ Start
          </Button>
          <Button onClick={() => ms.stop()} disabled={!ms.running()} variant="outline" style={{ flex: 1 }}>
            ■ Stop
          </Button>
          <Button onClick={() => ms.reset()} variant="secondary" style={{ flex: 1 }}>
            ↺ Reset
          </Button>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          The counter auto-resets every {LIMIT}ms (the <code>limit</code> option). Drag the
          fps slider to change the tick resolution while running.
        </p>
      </div>
    );
  },
});
