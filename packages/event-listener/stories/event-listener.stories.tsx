import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  makeEventListener,
  createEventListener,
  createEventSignal,
  WindowEventListener,
} from "@solid-primitives/event-listener";
import readme from "../README.md?raw";
import { StatRow, Card, Button as Btn, Container } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Browser APIs/Event Listener",
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

export const WindowEventListenerStory = meta.story({
  name: "Window events (WindowEventListener)",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story:
          "`WindowEventListener` is a component that attaches event listeners to `window` and removes them when unmounted. Toggle the component to see listeners attach and detach. Move the mouse anywhere in the canvas to see coordinates update.",
      },
    },
  },
  render: () => {
    const [enabled, setEnabled] = createSignal(true);
    const [mouse, setMouse] = createSignal({ x: 0, y: 0 });
    const [keyCount, setKeyCount] = createSignal(0);

    return (
      <div
        style={{
          "font-family": "system-ui",
          width: "440px",
          height: "20vh",
          display: "flex",
          "flex-direction": "column",
          "justify-content": "space-between",
          padding: "1.25rem",
          background: "white",
          border: "1px solid #e2e8f0",
          "border-radius": "12px",
          "box-shadow": "0 4px 12px rgba(0,0,0,0.06)",
          "box-sizing": "border-box",
        }}
      >
        <Show when={enabled()}>
          <WindowEventListener
            onmousemove={e => setMouse({ x: Math.round(e.clientX), y: Math.round(e.clientY) })}
            onkeydown={() => setKeyCount(n => n + 1)}
          />
        </Show>

        <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
          <span
            style={{
              "font-size": "0.72rem",
              "font-weight": "700",
              color: "#6366f1",
              "text-transform": "uppercase",
              "letter-spacing": "0.06em",
            }}
          >
            WindowEventListener
          </span>
          <div style={{ display: "flex", "align-items": "center", gap: "0.4rem" }}>
            <div
              style={{
                width: "7px",
                height: "7px",
                "border-radius": "50%",
                background: enabled() ? "#22c55e" : "#94a3b8",
              }}
            />
            <span style={{ "font-size": "0.78rem", color: enabled() ? "#16a34a" : "#64748b" }}>
              {enabled() ? "Listening" : "Detached"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.35rem" }}>
          <StatRow label="mouse.x" value={enabled() ? mouse().x : "—"} />
          <StatRow label="mouse.y" value={enabled() ? mouse().y : "—"} />
          <StatRow label="keydown count" value={enabled() ? keyCount() : "—"} />
        </div>

        <button
          onClick={() => setEnabled(v => !v)}
          style={{
            padding: "0.4rem 1rem",
            background: enabled() ? "#ef4444" : "#22c55e",
            color: "white",
            border: "none",
            "border-radius": "6px",
            "font-size": "0.85rem",
            cursor: "pointer",
            "font-family": "system-ui",
            "align-self": "flex-start",
          }}
        >
          {enabled() ? "Detach" : "Attach"}
        </button>
      </div>
    );
  },
});

export const ReactiveTargetsStory = meta.story({
  name: "Reactive targets (createEventListener)",
  parameters: {
    docs: {
      description: {
        story:
          "`createEventListener` accepts reactive signal accessors for `target` and `type`. When the signal changes, old listeners are removed and new ones are added automatically. Add tiles below — each new tile is immediately wired up.",
      },
    },
  },
  render: () => {
    const [items, setItems] = createSignal<HTMLDivElement[]>([]);
    const [lastClicked, setLastClicked] = createSignal<string>("—");

    createEventListener(items, "click", e => {
      setLastClicked((e.currentTarget as HTMLDivElement).dataset.label ?? "unknown");
    });

    return (
      <div
        style={{
          "font-family": "system-ui",
          width: "400px",
          display: "flex",
          "flex-direction": "column",
          gap: "1rem",
          padding: "1.25rem",
          background: "white",
          border: "1px solid #e2e8f0",
          "border-radius": "12px",
          "box-shadow": "0 4px 12px rgba(0,0,0,0.06)",
          "box-sizing": "border-box",
          height: "20vh",
          "overflow-y": "auto",
          "justify-content": "space-between",
        }}
      >
        <div style={{ display: "flex", "flex-wrap": "wrap", gap: "0.4rem" }}>
          <For each={Array.from({ length: 5 }, (_, i) => i)}>
            {i => (
              <div
                ref={el => {
                  el.dataset.label = `Tile ${i + 1}`;
                  setItems(p => [...p, el]);
                }}
                style={{
                  width: "64px",
                  height: "56px",
                  background: "#e0e7ff",
                  "border-radius": "8px",
                  display: "flex",
                  "align-items": "center",
                  "justify-content": "center",
                  cursor: "pointer",
                  "font-size": "0.85rem",
                  "font-weight": "700",
                  color: "#4f46e5",
                  "user-select": "none",
                }}
              >
                {i + 1}
              </div>
            )}
          </For>
        </div>

        <Card>
          <StatRow label="Last clicked tile" value={lastClicked()} />
        </Card>

        <p style={{ margin: 0, "font-size": "0.78rem", color: "#64748b" }}>
          One <code>createEventListener</code> call covers all five tiles.
        </p>
      </div>
    );
  },
});

export const EventSignalStory = meta.story({
  name: "Event as signal (createEventSignal)",
  parameters: {
    docs: {
      description: {
        story:
          "`createEventSignal` stores the last captured event in a reactive signal. It supports multiple event types via an array, and works with custom event maps for full type safety.",
      },
    },
  },
  render: () => {
    // Use a signal so createEventListener's internal createEffect tracks it reactively.
    // A plain `let ref` variable has no reactive dependency — the effect fires once on
    // mount but can't re-run if timing differs. A signal guarantees re-attachment.
    const [targetEl, setTargetEl] = createSignal<HTMLDivElement>();
    const [lastEvent, setLastEvent] = createSignal<Event>();

    createEventListener(
      targetEl as ReturnType<typeof createSignal<EventTarget>>[0],
      ["mouseenter", "mouseleave", "click", "contextmenu", "wheel"],
      e => setLastEvent(e),
    );

    const pos = () => {
      const e = lastEvent();
      if (e && "clientX" in e) return { x: Math.round((e as MouseEvent).clientX), y: Math.round((e as MouseEvent).clientY) };
      return null;
    };

    return (
      <Container width={400}>
        <h3 style={{ margin: 0 }}>createEventSignal</h3>

        <div
          ref={setTargetEl}
          style={{
            width: "100%",
            height: "140px",
            "border-radius": "10px",
            background: "#e0e7ff",
            border: "2px solid #c7d2fe",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            cursor: "pointer",
            "user-select": "none",
          }}
        >
          <span style={{ color: "#6366f1", "font-weight": "600", "font-size": "0.9rem" }}>
            Interact here (click, hover, scroll, right-click)
          </span>
        </div>

        <Card>
          <StatRow label="event.type" value={lastEvent()?.type ?? "—"} />
          <StatRow label="event.clientX" value={pos()?.x ?? "—"} />
          <StatRow label="event.clientY" value={pos()?.y ?? "—"} />
        </Card>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Listening for: <code>mouseenter</code>, <code>mouseleave</code>, <code>click</code>,{" "}
          <code>contextmenu</code>, <code>wheel</code>
        </p>
      </Container>
    );
  },
});

export const MakeEventListenerStory = meta.story({
  name: "Ref-based listeners (makeEventListener)",
  parameters: {
    docs: {
      description: {
        story:
          "Solid 2.0 removes `use:` directives in favour of **ref factories** — plain functions passed to `ref`. `makeEventListener` attaches a listener and calls `onCleanup` automatically when the element unmounts, making it the natural Solid 2.0 primitive for this pattern.",
      },
    },
  },
  render: () => {
    const [clickCount, setClickCount] = createSignal(0);
    const [dblClickCount, setDblClickCount] = createSignal(0);
    const [enterCount, setEnterCount] = createSignal(0);

    return (
      <Container width={400}>
        <h3 style={{ margin: 0 }}>makeEventListener via ref</h3>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            ref={el => makeEventListener(el, "click", () => setClickCount(n => n + 1))}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "#6366f1",
              color: "white",
              border: "none",
              "border-radius": "8px",
              "font-size": "1rem",
              cursor: "pointer",
              "font-family": "system-ui",
            }}
          >
            Click me
          </button>

          <button
            ref={el => makeEventListener(el, "dblclick", () => setDblClickCount(n => n + 1))}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "#0ea5e9",
              color: "white",
              border: "none",
              "border-radius": "8px",
              "font-size": "1rem",
              cursor: "pointer",
              "font-family": "system-ui",
            }}
          >
            Double-click
          </button>
        </div>

        <div
          ref={el => {
            makeEventListener(el, "mouseenter", () => setEnterCount(n => n + 1));
          }}
          style={{
            padding: "0.75rem",
            background: "#f0fdf4",
            border: "1px dashed #86efac",
            "border-radius": "8px",
            "text-align": "center",
            "font-size": "0.85rem",
            color: "#15803d",
            cursor: "default",
            "user-select": "none",
          }}
        >
          Hover to increment enter count
        </div>

        <Card>
          <StatRow label="click count" value={clickCount()} />
          <StatRow label="dblclick count" value={dblClickCount()} />
          <StatRow label="mouseenter count" value={enterCount()} />
        </Card>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          <code>ref={"{el => makeEventListener(el, 'click', handler)}"}</code> — the listener is
          registered during mount and removed automatically on cleanup via <code>onCleanup</code>.
        </p>
      </Container>
    );
  },
});

type MyEvents = { ping: CustomEvent<{ message: string }>; pong: CustomEvent<{ reply: string }> };

export const CustomEventsStory = meta.story({
  name: "Custom events (createEventSignal)",
  parameters: {
    docs: {
      description: {
        story:
          "Pass a custom event map type to `createEventSignal` for fully typed custom events. The generic constrains both the event names and their payload types at compile time.",
      },
    },
  },
  render: () => {
    const [busEl, setBusEl] = createSignal<HTMLDivElement>();
    const [lastEvent, setLastEvent] = createSignal<CustomEvent>();

    createEventListener(
      busEl as ReturnType<typeof createSignal<EventTarget>>[0],
      ["ping", "pong"],
      e => setLastEvent(e as CustomEvent),
    );

    const dispatch = (type: keyof MyEvents, detail: object) => {
      busEl()?.dispatchEvent(new CustomEvent(type, { detail }));
    };

    return (
      <Container width={400}>
        <h3 style={{ margin: 0 }}>Custom event map</h3>

        <div
          ref={setBusEl}
          style={{
            width: "100%",
            padding: "1rem",
            background: "#fdf4ff",
            border: "2px dashed #d8b4fe",
            "border-radius": "10px",
            "text-align": "center",
            color: "#7c3aed",
            "font-size": "0.85rem",
          }}
        >
          Event bus target
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Btn onClick={() => dispatch("ping", { message: "hello" })} color="#7c3aed">
            Dispatch ping
          </Btn>
          <Btn onClick={() => dispatch("pong", { reply: "world" })} color="#0ea5e9">
            Dispatch pong
          </Btn>
        </div>

        <Card>
          <StatRow label="event.type" value={lastEvent()?.type ?? "—"} />
          <StatRow
            label="event.detail"
            value={lastEvent() ? JSON.stringify(lastEvent()!.detail) : "—"}
          />
        </Card>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Uses a signal target so <code>createEventListener</code> tracks the element reactively.
          Dispatch either event with the buttons above to see the payload.
        </p>
      </Container>
    );
  },
});
