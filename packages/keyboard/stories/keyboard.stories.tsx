import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  useKeyDownList,
  useKeyDownSequence,
  createKeyHold,
  createShortcut,
} from "@solid-primitives/keyboard";
import readme from "../README.md?raw";
import { container, Kbd } from "./_helpers.js";

const meta = preview.meta({
  title: "Input & Events/Keyboard",
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

export const HeldKeys = meta.story({
  name: "Held keys (useKeyDownList)",
  parameters: {
    docs: {
      description: {
        story:
          "`useKeyDownList` is a singleton root that returns a signal of all currently held keys, ordered from least to most recent. Click the demo area to focus it, then press any combination of keys.",
      },
    },
  },
  render: () => {
    const keys = useKeyDownList();
    const [focused, setFocused] = createSignal(false);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>useKeyDownList</h3>

        <div
          tabindex={0}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            border: `2px solid ${focused() ? "#6366f1" : "#e2e8f0"}`,
            "border-radius": "8px",
            padding: "1.5rem",
            "text-align": "center",
            outline: "none",
            cursor: "pointer",
            "min-height": "80px",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            transition: "border-color 0.15s",
          }}
        >
          <Show
            when={keys().length > 0}
            fallback={
              <span style={{ color: "#94a3b8", "font-size": "0.9rem" }}>
                {focused() ? "Press any key…" : "Click here, then press keys"}
              </span>
            }
          >
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                "flex-wrap": "wrap",
                "justify-content": "center",
              }}
            >
              <For each={keys()}>{key => <Kbd>{key}</Kbd>}</For>
            </div>
          </Show>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Clears on <code>blur</code> or right-click. Modifier keys already held before focus are
          detected automatically.
        </p>
      </div>
    );
  },
});

export const KeyHold = meta.story({
  name: "Single key hold (createKeyHold)",
  parameters: {
    docs: {
      description: {
        story:
          "`createKeyHold` returns a boolean signal that is `true` only when the specified key is the *sole* key being held. Pressing any additional key simultaneously resets it to `false`.",
      },
    },
  },
  render: () => {
    const holding = createKeyHold("Control", { preventDefault: false });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createKeyHold("Control")</h3>

        <div
          style={{
            background: holding() ? "#6366f1" : "#f1f5f9",
            color: holding() ? "white" : "#64748b",
            "border-radius": "12px",
            padding: "2rem",
            "text-align": "center",
            "font-size": "1rem",
            "font-weight": "600",
            transition: "background 0.1s, color 0.1s",
          }}
        >
          {holding() ? "⌨ Holding Control!" : "Hold Control (alone)"}
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Pressing another key while holding Control resets the signal to <code>false</code>. The
          default <code>preventDefault: true</code> stops the browser's built-in Ctrl shortcuts.
        </p>
      </div>
    );
  },
});

export const Shortcut = meta.story({
  name: "Keyboard shortcut (createShortcut)",
  parameters: {
    docs: {
      description: {
        story:
          "`createShortcut` fires a callback when an exact key chord is pressed in order. `preventDefault` (default `true`) stops the browser's default action for every key in the sequence. `requireReset: true` prevents repeat-firing while the keys stay held.",
      },
    },
  },
  render: () => {
    const [count, setCount] = createSignal(0);
    const [flash, setFlash] = createSignal(false);

    createShortcut(
      ["Control", "K"],
      () => {
        setCount(c => c + 1);
        setFlash(true);
        setTimeout(() => setFlash(false), 600);
      },
      { requireReset: true },
    );

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createShortcut(["Control", "K"])</h3>

        <div
          style={{
            background: flash() ? "#10b981" : "#f8fafc",
            border: `2px solid ${flash() ? "#10b981" : "#e2e8f0"}`,
            "border-radius": "8px",
            padding: "1.5rem",
            "text-align": "center",
            transition: "background 0.15s, border-color 0.15s",
          }}
        >
          <div
            style={{
              "font-size": "1.5rem",
              "font-weight": "700",
              color: flash() ? "white" : "#1e293b",
            }}
          >
            {count()}
          </div>
          <div
            style={{
              "font-size": "0.85rem",
              color: flash() ? "white" : "#64748b",
              "margin-top": "0.25rem",
            }}
          >
            {flash() ? "Triggered!" : "Press Ctrl+K"}
          </div>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          <code>requireReset: true</code> — you must release all keys before the shortcut fires
          again.
        </p>
      </div>
    );
  },
});

export const KeySequence = meta.story({
  name: "Key sequence (useKeyDownSequence)",
  parameters: {
    docs: {
      description: {
        story:
          "`useKeyDownSequence` tracks the growing sequence of keys as you hold them down. Each entry is a snapshot of all keys held at that point. The sequence resets when all keys are released.",
      },
    },
  },
  render: () => {
    const sequence = useKeyDownSequence();

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>useKeyDownSequence</h3>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            "border-radius": "8px",
            padding: "1rem",
            "min-height": "80px",
            "font-family": "monospace",
            "font-size": "0.85rem",
          }}
        >
          <Show
            when={sequence().length > 0}
            fallback={<span style={{ color: "#94a3b8" }}>Press some keys…</span>}
          >
            <For each={sequence()}>
              {(step, i) => (
                <div
                  style={{
                    display: "flex",
                    "align-items": "center",
                    gap: "0.3rem",
                    "margin-bottom": "0.3rem",
                  }}
                >
                  <span style={{ color: "#94a3b8", "min-width": "1.5rem" }}>{i() + 1}.</span>
                  <For each={step}>
                    {(key, j) => (
                      <>
                        <Show when={j() > 0}>
                          <span style={{ color: "#94a3b8" }}>+</span>
                        </Show>
                        <Kbd>{key}</Kbd>
                      </>
                    )}
                  </For>
                </div>
              )}
            </For>
          </Show>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Try: hold <Kbd>Control</Kbd>, add <Kbd>Shift</Kbd>, then <Kbd>A</Kbd> — watch three steps
          build up before you release.
        </p>
      </div>
    );
  },
});
