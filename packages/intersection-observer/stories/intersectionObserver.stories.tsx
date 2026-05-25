import { createSignal, For } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createVisibilityObserver,
  createViewportObserver,
  makeIntersectionObserver,
  withOccurrence,
  type AddViewportObserverEntry,
} from "@solid-primitives/intersection-observer";
import readme from "../README.md?raw";
import { container, btnStyle } from "./_helpers.js";

const meta = preview.meta({
  title: "Display & Media/Intersection Observer",
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

export const VisibilityObserverStory = meta.story({
  name: "createVisibilityObserver",
  parameters: {
    docs: {
      description: {
        story:
          "`createVisibilityObserver(element, options?)` returns a reactive `Accessor<boolean>` that reflects whether the element is intersecting the given root (or the viewport). Each item in the scrollable grid below gets its own observer scoped to the container via `root`. Scroll to see items toggle between visible and hidden.",
      },
    },
  },
  render: () => {
    let containerRef!: HTMLDivElement;

    const ITEMS = Array.from({ length: 16 }, (_, i) => i + 1);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createVisibilityObserver</h3>
        <p style={{ margin: 0, "font-size": "0.85rem", color: "#64748b" }}>
          Scroll the grid — items highlight when ≥ 60% visible inside the container.
        </p>

        <div
          ref={el => (containerRef = el)}
          style={{
            height: "240px",
            "overflow-y": "auto",
            border: "1px solid #e2e8f0",
            "border-radius": "8px",
            padding: "0.5rem",
            display: "grid",
            "grid-template-columns": "repeat(3, 1fr)",
            gap: "0.5rem",
            "align-content": "start",
          }}
        >
          <For each={ITEMS}>
            {item => {
              let ref!: HTMLDivElement;
              const isVisible = createVisibilityObserver(
                () => ref,
                { root: containerRef, threshold: 0.6, initialValue: false },
              );
              return (
                <div
                  ref={el => (ref = el)}
                  style={{
                    height: "64px",
                    "border-radius": "6px",
                    background: isVisible() ? "#6366f1" : "#e2e8f0",
                    color: isVisible() ? "white" : "#94a3b8",
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    "font-weight": "600",
                    "font-size": "0.85rem",
                    transition: "background 0.2s, color 0.2s",
                  }}
                >
                  {isVisible() ? "✓" : ""} {item}
                </div>
              );
            }}
          </For>
        </div>
      </div>
    );
  },
});

export const VisibilityOccurrenceStory = meta.story({
  name: "createVisibilityObserver + withOccurrence",
  parameters: {
    docs: {
      description: {
        story:
          "`withOccurrence` wraps the visibility setter to provide an `occurrence` value — `Entering`, `Leaving`, `Inside`, or `Outside` — in addition to the boolean. Pass it as the third argument to `createVisibilityObserver`. The items below show their current occurrence label as you scroll.",
      },
    },
  },
  render: () => {
    let containerRef!: HTMLDivElement;
    const ITEMS = Array.from({ length: 14 }, (_, i) => i + 1);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createVisibilityObserver + withOccurrence</h3>
        <p style={{ margin: 0, "font-size": "0.85rem", color: "#64748b" }}>
          Scroll to see <em>Entering</em> / <em>Leaving</em> / <em>Inside</em> / <em>Outside</em>.
        </p>

        <div
          ref={el => (containerRef = el)}
          style={{
            height: "240px",
            "overflow-y": "auto",
            border: "1px solid #e2e8f0",
            "border-radius": "8px",
            padding: "0.5rem",
            display: "grid",
            "grid-template-columns": "repeat(2, 1fr)",
            gap: "0.5rem",
            "align-content": "start",
          }}
        >
          <For each={ITEMS}>
            {item => {
              let ref!: HTMLDivElement;
              const [occ, setOcc] = createSignal("Outside");

              const isVisible = createVisibilityObserver(
                () => ref,
                { root: containerRef, threshold: 0.5, initialValue: false },
                withOccurrence((entry, { occurrence }) => {
                  setOcc(occurrence);
                  return entry.isIntersecting;
                }),
              );

              const color = () => {
                switch (occ()) {
                  case "Entering": return "#10b981";
                  case "Inside":   return "#6366f1";
                  case "Leaving":  return "#f97316";
                  default:         return "#e2e8f0";
                }
              };

              return (
                <div
                  ref={el => (ref = el)}
                  style={{
                    height: "64px",
                    "border-radius": "6px",
                    background: color(),
                    color: isVisible() ? "white" : "#94a3b8",
                    display: "flex",
                    "flex-direction": "column",
                    "align-items": "center",
                    "justify-content": "center",
                    "font-size": "0.78rem",
                    "font-weight": "600",
                    transition: "background 0.2s, color 0.2s",
                    gap: "0.2rem",
                  }}
                >
                  <span>{item}</span>
                  <span style={{ "font-weight": "400", opacity: 0.85 }}>{occ()}</span>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    );
  },
});

export const ViewportObserverStory = meta.story({
  name: "createViewportObserver",
  parameters: {
    docs: {
      description: {
        story:
          "`createViewportObserver` returns an `[add, { remove, stop, instance }]` tuple. One shared `IntersectionObserver` instance is used for all elements — more efficient than one observer per element. The curried form `add(callback)` returns a ref callback suitable for use as a JSX `ref`.",
      },
    },
  },
  render: () => {
    let containerRef!: HTMLDivElement;
    let addFn!: AddViewportObserverEntry;

    const ITEMS = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      visible: createSignal(false),
    }));

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createViewportObserver</h3>
        <p style={{ margin: 0, "font-size": "0.85rem", color: "#64748b" }}>
          One shared observer watches all 12 items. Scroll to see them react.
        </p>

        <div
          ref={el => {
            containerRef = el;
            const [add] = createViewportObserver([], () => {}, {
              root: containerRef,
              threshold: 0.5,
            });
            addFn = add;
          }}
          style={{
            height: "220px",
            "overflow-y": "auto",
            border: "1px solid #e2e8f0",
            "border-radius": "8px",
            padding: "0.5rem",
            display: "grid",
            "grid-template-columns": "repeat(3, 1fr)",
            gap: "0.5rem",
            "align-content": "start",
          }}
        >
          <For each={ITEMS}>
            {item => {
              const [isVisible, setIsVisible] = item.visible;
              return (
                <div
                  ref={el => {
                    if (addFn) addFn(el, entry => setIsVisible(entry.isIntersecting));
                  }}
                  style={{
                    height: "64px",
                    "border-radius": "6px",
                    background: isVisible() ? "#10b981" : "#e2e8f0",
                    color: isVisible() ? "white" : "#94a3b8",
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    "font-weight": "600",
                    "font-size": "0.85rem",
                    transition: "background 0.2s, color 0.2s",
                  }}
                >
                  {isVisible() ? "✓" : ""} {item.id}
                </div>
              );
            }}
          </For>
        </div>
      </div>
    );
  },
});

export const MakeIntersectionObserverStory = meta.story({
  name: "makeIntersectionObserver (imperative)",
  parameters: {
    docs: {
      description: {
        story:
          "`makeIntersectionObserver(elements, onChange, options)` is the non-reactive imperative primitive. It creates an `IntersectionObserver`, immediately observes the provided elements, and returns `{ add, remove, start, reset, stop, instance }`. `onCleanup` is called automatically when the reactive scope disposes.",
      },
    },
  },
  render: () => {
    const [log, setLog] = createSignal<{ id: number; msg: string }[]>([]);
    const pushLog = (msg: string) =>
      setLog(prev => [{ id: Date.now() + Math.random(), msg }, ...prev].slice(0, 8));

    let containerRef!: HTMLDivElement;
    let addEl!: (el: Element) => void;

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>makeIntersectionObserver</h3>

        <div
          ref={el => {
            containerRef = el;
            const { add } = makeIntersectionObserver([], entries => {
              for (const entry of entries) {
                const label = (entry.target as HTMLElement).dataset["label"] ?? "?";
                pushLog(`${label}: ${entry.isIntersecting ? "visible" : "hidden"}`);
              }
            }, { root: containerRef, threshold: 0.5 });
            addEl = add;
          }}
          style={{
            height: "180px",
            "overflow-y": "auto",
            border: "1px solid #e2e8f0",
            "border-radius": "8px",
            padding: "0.5rem",
            display: "flex",
            "flex-direction": "column",
            gap: "0.4rem",
          }}
        >
          <For each={Array.from({ length: 8 }, (_, i) => `Box ${i + 1}`)}>
            {label => (
              <div
                ref={el => {
                  el.dataset["label"] = label;
                  if (addEl) addEl(el);
                }}
                style={{
                  height: "48px",
                  "border-radius": "6px",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  "align-items": "center",
                  "justify-content": "center",
                  "font-size": "0.85rem",
                  color: "#475569",
                  "flex-shrink": 0,
                  "font-weight": "500",
                }}
              >
                {label}
              </div>
            )}
          </For>
        </div>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            "border-radius": "6px",
            padding: "0.5rem 0.75rem",
            "min-height": "72px",
            "font-size": "0.8rem",
            "font-family": "monospace",
            color: "#334155",
          }}
        >
          <For each={log()}>
            {(entry, i) => (
              <div style={{ color: i() === 0 ? "#1e293b" : "#94a3b8", "line-height": "1.5" }}>
                {entry.msg}
              </div>
            )}
          </For>
          {log().length === 0 && (
            <span style={{ color: "#94a3b8" }}>Scroll above to see intersection events…</span>
          )}
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Elements are added with <code>add(el)</code> after the observer is created. The raw{" "}
          <code>onChange</code> callback receives all changed entries in one batch.
        </p>
      </div>
    );
  },
});
