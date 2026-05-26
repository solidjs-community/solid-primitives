import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createScrollPosition,
  useWindowScrollPosition,
  createPreventScroll,
} from "@solid-primitives/scroll";
import readme from "../README.md?raw";
import { container } from "./_helpers.js";
import { StatRow } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Browser APIs/Scroll",
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

export const ScrollPositionStory = meta.story({
  name: "Scroll position (createScrollPosition)",
  parameters: {
    docs: {
      description: {
        story:
          "`createScrollPosition` returns a reactive `{ x, y }` store-like object that updates as the target element scrolls. Pass a function accessor to handle ref population automatically.",
      },
    },
  },
  render: () => {
    let boxRef: HTMLDivElement | undefined;
    const scroll = createScrollPosition(() => boxRef);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createScrollPosition</h3>

        <div
          ref={el => (boxRef = el)}
          style={{
            width: "100%",
            height: "200px",
            overflow: "auto",
            border: "1px solid #e2e8f0",
            "border-radius": "8px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "800px",
              height: "600px",
              background:
                "repeating-linear-gradient(45deg, #f8fafc, #f8fafc 20px, #e0e7ff 20px, #e0e7ff 40px)",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              "font-size": "1rem",
              color: "#6366f1",
              "font-weight": "600",
            }}
          >
            Scroll me ↔ ↕
          </div>
        </div>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            "border-radius": "8px",
            padding: "0.75rem",
            display: "flex",
            "flex-direction": "column",
            gap: "0.4rem",
          }}
        >
          <StatRow label="scroll.x" value={Math.round(scroll.x)} />
          <StatRow label="scroll.y" value={Math.round(scroll.y)} />
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Scroll inside the box — both axes update in real time.
        </p>
      </div>
    );
  },
});

export const WindowScrollStory = meta.story({
  name: "Window scroll (useWindowScrollPosition)",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "`useWindowScrollPosition` is a singleton-root version of `createScrollPosition` scoped to `window`. It shares one event listener across all dependents. Scroll the page to see the values update.",
      },
    },
  },
  render: () => {
    const scroll = useWindowScrollPosition();

    return (
      <div
        style={{
          "font-family": "system-ui",
          "min-height": "250vh",
          padding: "2rem",
        }}
      >
        <div
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            background: "white",
            border: "1px solid #e2e8f0",
            "border-radius": "10px",
            padding: "0.875rem 1.25rem",
            "box-shadow": "0 4px 12px rgba(0,0,0,0.08)",
            display: "flex",
            "flex-direction": "column",
            gap: "0.4rem",
            "min-width": "180px",
            "z-index": 10,
          }}
        >
          <div
            style={{
              "font-size": "0.78rem",
              "font-weight": "600",
              color: "#6366f1",
              "text-transform": "uppercase",
              "letter-spacing": "0.05em",
              "margin-bottom": "0.2rem",
            }}
          >
            useWindowScrollPosition
          </div>
          <StatRow label="window.scrollX" value={Math.round(scroll.x)} />
          <StatRow label="window.scrollY" value={Math.round(scroll.y)} />
        </div>

        <h2>Scroll the page to see live updates</h2>
        <p style={{ color: "#64748b", "max-width": "500px" }}>
          The fixed overlay in the top-right corner reads from a singleton reactive object backed by
          a single <code>scroll</code> event listener shared across all consumers.
        </p>

        <For each={Array.from({ length: 20 }, (_, i) => i)}>
          {i => (
            <div
              style={{
                "border-bottom": "1px solid #f1f5f9",
                padding: "1rem 0",
                color: "#475569",
                "font-size": "0.9rem",
              }}
            >
              Paragraph {i + 1} — keep scrolling to see the counter increment.
            </div>
          )}
        </For>
      </div>
    );
  },
});

export const PreventScrollStory = meta.story({
  name: "Prevent scroll (createPreventScroll)",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "`createPreventScroll` intercepts `wheel` and `touchmove` events on the document. While the modal is open, only the element passed to `element` can scroll — the page behind it cannot. Close the modal to restore normal scroll.",
      },
    },
  },
  render: () => {
    const [open, setOpen] = createSignal(false);
    let modalRef: HTMLDivElement | undefined;

    createPreventScroll({
      element: () => modalRef,
      enabled: open,
    });

    return (
      <div style={{ "font-family": "system-ui", padding: "2rem", "min-height": "250vh" }}>
        <h2 style={{ "margin-top": 0 }}>Background page</h2>
        <p style={{ color: "#64748b", "max-width": "480px" }}>
          This page is intentionally tall so you can scroll it. Open the modal — while it is open
          you will not be able to scroll this page. Close the modal to restore normal scrolling.
        </p>

        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "0.6rem 1.25rem",
            background: "#6366f1",
            color: "white",
            border: "none",
            "border-radius": "6px",
            "font-size": "0.95rem",
            cursor: "pointer",
            "margin-bottom": "2rem",
          }}
        >
          Open modal
        </button>

        <For each={Array.from({ length: 25 }, (_, i) => i)}>
          {i => (
            <p
              style={{
                "border-bottom": "1px solid #f1f5f9",
                padding: "0.75rem 0",
                color: "#475569",
                "font-size": "0.9rem",
                margin: 0,
              }}
            >
              Page paragraph {i + 1}
            </p>
          )}
        </For>

        <Show when={open()}>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.5)",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              "z-index": 50,
            }}
          >
            <div
              ref={el => (modalRef = el)}
              style={{
                background: "white",
                "border-radius": "12px",
                padding: "1.5rem",
                width: "380px",
                "max-height": "55vh",
                overflow: "auto",
                "box-shadow": "0 20px 60px rgba(0,0,0,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  "justify-content": "space-between",
                  "align-items": "center",
                  "margin-bottom": "1rem",
                }}
              >
                <h3 style={{ margin: 0, "font-size": "1.1rem" }}>Modal (scrollable)</h3>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    border: "none",
                    background: "transparent",
                    "font-size": "1.25rem",
                    cursor: "pointer",
                    color: "#64748b",
                    padding: "0.25rem",
                    "line-height": 1,
                  }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <p style={{ color: "#64748b", "font-size": "0.9rem", "margin-top": 0 }}>
                Scroll inside this panel — it works. Try scrolling the page behind it — it is
                locked.
              </p>

              <For each={Array.from({ length: 18 }, (_, i) => i)}>
                {i => (
                  <p
                    style={{
                      "border-bottom": "1px solid #f1f5f9",
                      padding: "0.6rem 0",
                      color: "#475569",
                      "font-size": "0.88rem",
                      margin: 0,
                    }}
                  >
                    Modal content row {i + 1}
                  </p>
                )}
              </For>
            </div>
          </div>
        </Show>
      </div>
    );
  },
});
