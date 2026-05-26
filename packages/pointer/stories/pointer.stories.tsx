import { createSignal, For, type Accessor } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createPointerPosition,
  createPointerList,
  createPointerListeners,
  pointerHover,
} from "@solid-primitives/pointer";
import readme from "../README.md?raw";
import { container, TrackingBox } from "./_helpers.js";
import { StatRow } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Inputs/Pointer",
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

export const PointerPositionStory = meta.story({
  name: "Pointer position (createPointerPosition)",
  parameters: {
    docs: {
      description: {
        story:
          "`createPointerPosition` returns a reactive signal that tracks the position and active state of the first pointer entering the target. Move your mouse (or touch/pen) inside the box below.",
      },
    },
  },
  render: () => {
    // Signal target so createPointerListeners' internal createEffect tracks it reactively.
    const [boxEl, setBoxEl] = createSignal<HTMLDivElement>();
    const pos = createPointerPosition({ target: boxEl as Accessor<EventTarget> });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createPointerPosition</h3>

        <TrackingBox active={pos().isActive}>
          <div
            ref={setBoxEl}
            style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
          />
          <span
            style={{
              color: pos().isActive ? "#6366f1" : "#94a3b8",
              "font-size": "0.85rem",
              "pointer-events": "none",
            }}
          >
            {pos().isActive
              ? `(${Math.round(pos().x)}, ${Math.round(pos().y)})`
              : "Move pointer here"}
          </span>
        </TrackingBox>

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
          <StatRow label="x" value={Math.round(pos().x)} />
          <StatRow label="y" value={Math.round(pos().y)} />
          <StatRow label="isActive" value={String(pos().isActive)} />
          <StatRow label="pointerType" value={pos().pointerType || "—"} />
          <StatRow label="pressure" value={pos().pressure.toFixed(2)} />
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Tracks mouse, touch, and pen. <code>isActive</code> is <code>false</code> when the
          pointer leaves the element.
        </p>
      </div>
    );
  },
});

export const PointerListStory = meta.story({
  name: "Pointer list (createPointerList)",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story:
          "`createPointerList` returns a signal containing an array of reactive accessor signals — one per active pointer. Each item tracks position and `isDown` state individually. Try using multiple fingers on a touch screen.",
      },
    },
  },
  render: () => {
    const [canvasEl, setCanvasEl] = createSignal<HTMLDivElement>();
    const pointers = createPointerList({ target: canvasEl as Accessor<EventTarget> });

    return (
      <div
        style={{
          ...container,
          height: "20vh",
          "box-sizing": "border-box",
          "justify-content": "space-between",
        }}
      >
        <div
          ref={setCanvasEl}
          style={{
            flex: 1,
            "border-radius": "10px",
            background: "#f8fafc",
            border: "2px dashed #cbd5e1",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            "touch-action": "none",
            "user-select": "none",
            cursor: "crosshair",
            "min-height": 0,
          }}
        >
          <span style={{ color: "#94a3b8", "font-size": "0.85rem", "pointer-events": "none" }}>
            {pointers().length === 0
              ? "Move pointer here"
              : `${pointers().length} active pointer${pointers().length > 1 ? "s" : ""}`}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            gap: "0.2rem",
            "min-height": "2rem",
          }}
        >
          <For each={pointers()} fallback={
            <span style={{ "font-size": "0.78rem", color: "#94a3b8", "font-family": "monospace" }}>
              no active pointers
            </span>
          }>
            {(ptr, i) => {
              const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#0ea5e9"];
              const color = () => colors[i() % colors.length]!;
              return (
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    "font-size": "0.78rem",
                    "font-family": "monospace",
                    "align-items": "center",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "10px",
                      height: "10px",
                      "border-radius": "50%",
                      background: color(),
                      "flex-shrink": 0,
                    }}
                  />
                  <span style={{ color: "#334155" }}>
                    #{ptr().pointerId} ({Math.round(ptr().x)}, {Math.round(ptr().y)})
                  </span>
                  <span style={{ color: ptr().isDown ? "#6366f1" : "#94a3b8" }}>
                    {ptr().isDown ? "▼ down" : "hover"}
                  </span>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    );
  },
});

export const PointerListenersStory = meta.story({
  name: "Pointer event listeners (createPointerListeners)",
  parameters: {
    docs: {
      description: {
        story:
          "`createPointerListeners` wires up individual pointer event handlers on a target element. Pass `pointerTypes` to filter by `'mouse'`, `'touch'`, or `'pen'`. All listeners are automatically removed on cleanup.",
      },
    },
  },
  render: () => {
    // Signal target so createEventListener inside createPointerListeners tracks it reactively.
    const [boxEl, setBoxEl] = createSignal<HTMLDivElement>();
    const [events, setEvents] = createSignal<{ type: string; x: number; y: number }[]>([]);

    const log = (type: string, e: PointerEvent) =>
      setEvents(prev => [{ type, x: Math.round(e.x), y: Math.round(e.y) }, ...prev].slice(0, 8));

    createPointerListeners({
      target: boxEl as Accessor<EventTarget>,
      onEnter: e => log("enter", e),
      onLeave: e => log("leave", e),
      onDown: e => log("down", e),
      onUp: e => log("up", e),
      onMove: e => log("move", e),
    });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createPointerListeners</h3>

        <div
          ref={setBoxEl}
          style={{
            width: "100%",
            height: "120px",
            border: "2px dashed #cbd5e1",
            "border-radius": "10px",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            background: "#f8fafc",
            cursor: "crosshair",
            "user-select": "none",
            "touch-action": "none",
          }}
        >
          <span style={{ color: "#94a3b8", "font-size": "0.85rem" }}>
            Interact here (enter, down, move, up, leave)
          </span>
        </div>

        <div
          style={{
            background: "#0f172a",
            "border-radius": "8px",
            padding: "0.75rem",
            "min-height": "120px",
            display: "flex",
            "flex-direction": "column",
            gap: "0.2rem",
            overflow: "hidden",
          }}
        >
          <For each={events()}>
            {(ev, i) => (
              <div
                style={{
                  "font-family": "monospace",
                  "font-size": "0.78rem",
                  color: i() === 0 ? "#a5f3fc" : "#64748b",
                  transition: "color 0.2s",
                }}
              >
                <span style={{ color: "#f59e0b" }}>{ev.type}</span> ({ev.x}, {ev.y})
              </div>
            )}
          </For>
          {events().length === 0 && (
            <span
              style={{ color: "#475569", "font-size": "0.78rem", "font-family": "monospace" }}
            >
              waiting for events…
            </span>
          )}
        </div>
      </div>
    );
  },
});

export const PointerHoverStory = meta.story({
  name: "Hover detection (pointerHover)",
  parameters: {
    docs: {
      description: {
        story:
          "`pointerHover` reports whether at least one pointer is hovering over the element. In Solid 2.0 it is used as a **ref factory** — `ref={el => pointerHover(el, () => handler)}` — instead of the removed `use:` directive syntax.",
      },
    },
  },
  render: () => {
    const [isHovered, setIsHovered] = createSignal(false);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>pointerHover</h3>

        <div
          ref={el => pointerHover(el, () => setIsHovered)}
          style={{
            width: "100%",
            height: "160px",
            "border-radius": "12px",
            background: isHovered() ? "#6366f1" : "#e0e7ff",
            border: `2px solid ${isHovered() ? "#4f46e5" : "#c7d2fe"}`,
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            cursor: "pointer",
            transition: "all 0.2s",
            "user-select": "none",
          }}
        >
          <span
            style={{
              color: isHovered() ? "white" : "#6366f1",
              "font-weight": "600",
              "font-size": "1rem",
              transition: "color 0.2s",
            }}
          >
            {isHovered() ? "Hovering!" : "Hover over me"}
          </span>
        </div>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            "border-radius": "8px",
            padding: "0.75rem",
          }}
        >
          <StatRow label="isHovered" value={String(isHovered())} />
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Handles multiple simultaneous pointers — hover is <code>false</code> only when{" "}
          <em>all</em> pointers have left the element.
        </p>
      </div>
    );
  },
});
