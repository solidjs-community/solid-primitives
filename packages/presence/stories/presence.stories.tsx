import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createPresence } from "@solid-primitives/presence";
import readme from "../README.md?raw";
import { makeContainer, Button, BoolRow } from "../../../.storybook/ui/index.js";

const container = makeContainer(340);

const meta = preview.meta({
  title: "Animation/Presence",
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

export const ShowHide = meta.story({
  name: "Show / Hide (boolean)",
  parameters: {
    docs: {
      description: {
        story:
          "`createPresence` keeps the element mounted for the full exit duration before removing it from the DOM. `isMounted` controls `<Show>`, while `isVisible` drives the CSS transition — ensuring the exit animation plays to completion before the node unmounts.",
      },
    },
  },
  render: () => {
    const [show, setShow] = createSignal(true);
    const { isMounted, isVisible, isAnimating, isEntering, isExiting } = createPresence(show, {
      transitionDuration: 500,
    });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createPresence — boolean</h3>

        <Button onClick={() => setShow(v => !v)}>{show() ? "Hide" : "Show"}</Button>

        <Show when={isMounted()}>
          <div
            style={{
              padding: "1rem",
              background: "#f1f5f9",
              "border-radius": "8px",
              transition: "opacity 500ms ease, transform 500ms ease",
              opacity: isVisible() ? "1" : "0",
              transform: isVisible() ? "translateY(0)" : "translateY(-12px)",
            }}
          >
            Hello, I animate in and out!
          </div>
        </Show>

        <div
          style={{
            padding: "0.75rem",
            background: "#f8fafc",
            "border-radius": "6px",
            border: "1px solid #e2e8f0",
            display: "flex",
            "flex-direction": "column",
            gap: "0.3rem",
          }}
        >
          <BoolRow label="isMounted" value={isMounted()} />
          <BoolRow label="isVisible" value={isVisible()} />
          <BoolRow label="isAnimating" value={isAnimating()} />
          <BoolRow label="isEntering" value={isEntering()} />
          <BoolRow label="isExiting" value={isExiting()} />
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          The element stays in the DOM until the 500ms exit transition finishes — unmounting
          happens only after the animation completes.
        </p>
      </div>
    );
  },
});

export const ItemSwitcher = meta.story({
  name: "Item switcher",
  parameters: {
    docs: {
      description: {
        story:
          "`createPresence` accepts any item type, not just booleans. `mountedItem` holds the item currently being rendered — it lags behind the active item so the exit animation can complete before the next item enters. Combine `isEntering` and `isExiting` for directional slide transitions.",
      },
    },
  },
  render: () => {
    const ITEMS = ["Alpha", "Beta", "Gamma", "Delta"] as const;
    const [active, setActive] = createSignal<(typeof ITEMS)[number] | undefined>(ITEMS[0]);
    const { isMounted, mountedItem, isVisible, isEntering, isExiting } = createPresence(active, {
      transitionDuration: 400,
    });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createPresence — item switcher</h3>

        <div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
          <For each={[...ITEMS]}>
            {item => (
              <Button
                onClick={() => setActive(v => (v === item ? undefined : item))}
                variant={active() === item ? "primary" : "outline"}
                style={{ flex: 1 }}
              >
                {item}
              </Button>
            )}
          </For>
        </div>

        <div
          style={{
            height: "64px",
            position: "relative",
            overflow: "hidden",
            background: "#f1f5f9",
            "border-radius": "8px",
          }}
        >
          <Show when={isMounted()}>
            <div
              style={{
                position: "absolute",
                inset: "0",
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                transition: "all 400ms ease",
                opacity: isEntering() || isExiting() ? "0" : "1",
                transform: isEntering()
                  ? "translateX(-24px)"
                  : isExiting()
                    ? "translateX(24px)"
                    : "translateX(0)",
              }}
            >
              <strong style={{ "font-size": "1.2rem" }}>{mountedItem()}</strong>
            </div>
          </Show>
          <Show when={!isMounted()}>
            <div
              style={{
                position: "absolute",
                inset: "0",
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                color: "#94a3b8",
                "font-size": "0.85rem",
              }}
            >
              — none selected —
            </div>
          </Show>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Click a button to switch items. The exiting item slides out before the next one
          slides in. Click the active button again to deselect.
        </p>
      </div>
    );
  },
});

export const SeparateDurations = meta.story({
  name: "Asymmetric enter / exit durations",
  parameters: {
    docs: {
      description: {
        story:
          "Pass `enterDuration` and `exitDuration` separately to give each transition its own timing. Here the element snaps in (200ms) but lingers out (800ms) — a common pattern for attention cues and toast notifications.",
      },
    },
  },
  render: () => {
    const [show, setShow] = createSignal(false);
    const { isMounted, isVisible, isEntering, isExiting } = createPresence(show, {
      enterDuration: 200,
      exitDuration: 800,
    });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>Enter 200ms / Exit 800ms</h3>

        <Button onClick={() => setShow(v => !v)}>
          {show() ? "Hide (slow exit)" : "Show (fast enter)"}
        </Button>

        <Show when={isMounted()}>
          <div
            style={{
              padding: "1rem",
              background: "#ede9fe",
              border: "2px solid #8b5cf6",
              "border-radius": "8px",
              transition: isEntering()
                ? "opacity 200ms ease, transform 200ms ease"
                : "opacity 800ms ease, transform 800ms ease",
              opacity: isVisible() ? "1" : "0",
              transform: isVisible() ? "scale(1)" : "scale(0.92)",
            }}
          >
            Fast in, slow out
          </div>
        </Show>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            "font-size": "0.82rem",
            color: "#64748b",
          }}
        >
          <span>
            <strong style={{ color: "#7c3aed" }}>entering:</strong> {String(isEntering())}
          </span>
          <span>
            <strong style={{ color: "#7c3aed" }}>exiting:</strong> {String(isExiting())}
          </span>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Toggle quickly to see the transitions overlap. The CSS duration switches between
          200ms and 800ms based on which phase is active.
        </p>
      </div>
    );
  },
});
