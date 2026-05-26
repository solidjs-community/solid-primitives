import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createEventBus,
  createEmitter,
  createEventHub,
  createEventStack,
} from "@solid-primitives/event-bus";
import readme from "../README.md?raw";
import { container } from "./_helpers.js";
import { inputStyle, btnStyle } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Utilities/Event Bus",
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

export const EventBusStory = meta.story({
  name: "createEventBus",
  parameters: {
    docs: {
      description: {
        story:
          "`createEventBus<T>()` is a simple typed pub/sub channel. `emit(value)` broadcasts to all current listeners; `listen(handler)` subscribes and returns a cleanup function. The switch and light below are fully decoupled — the bus carries the boolean state between them.",
      },
    },
  },
  render: () => {
    const bus = createEventBus<boolean>();
    const [on, setOn] = createSignal(true);
    const [lightOn, setLightOn] = createSignal(true);

    bus.listen(setLightOn);

    const toggle = () => {
      const next = !on();
      setOn(next);
      bus.emit(next);
    };

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createEventBus</h3>

        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            gap: "2.5rem",
            padding: "1.5rem",
            background: "#0f172a",
            "border-radius": "10px",
          }}
        >
          <button
            onClick={toggle}
            style={{
              padding: "0.5rem 1.4rem",
              "border-radius": "6px",
              border: "none",
              background: on() ? "#f1f5f9" : "#334155",
              color: on() ? "#0f172a" : "#94a3b8",
              cursor: "pointer",
              "font-weight": "700",
              "font-size": "0.9rem",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {on() ? "ON" : "OFF"}
          </button>
          <div
            style={{
              width: "60px",
              height: "60px",
              "border-radius": "50%",
              background: lightOn() ? "#fef08a" : "#1e293b",
              "box-shadow": lightOn() ? "0 0 28px 8px #fef08a88" : "none",
              transition: "background 0.2s, box-shadow 0.2s",
            }}
          />
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          The switch emits on the bus; the light subscribes. They share no direct reference.
        </p>
      </div>
    );
  },
});

export const EmitterStory = meta.story({
  name: "createEmitter",
  parameters: {
    docs: {
      description: {
        story:
          "`createEmitter<M>()` manages multiple named event channels in a single object. `on(name, handler)` subscribes to a specific channel; `emit(name, payload)` fires it. Ideal when one module needs to broadcast several distinct event types.",
      },
    },
  },
  render: () => {
    const emitter = createEmitter<{
      greet: string;
      count: number;
    }>();

    const [log, setLog] = createSignal<string[]>([]);
    const push = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 6));

    emitter.on("greet", name => push(`👋 Hello, ${name}!`));
    emitter.on("count", n => push(`🔢 Count: ${n}`));

    const [name, setName] = createSignal("world");
    const [count, setCount] = createSignal(0);

    const inc = () => {
      const next = count() + 1;
      setCount(next);
      emitter.emit("count", next);
    };
    const dec = () => {
      const next = count() - 1;
      setCount(next);
      emitter.emit("count", next);
    };

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createEmitter</h3>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={name()}
            onInput={e => setName(e.currentTarget.value)}
            placeholder="name"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={() => emitter.emit("greet", name())} style={btnStyle}>
            Greet
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <button onClick={dec} style={{ ...btnStyle, width: "36px", padding: "0.4rem" }}>
            −
          </button>
          <span
            style={{
              flex: 1,
              "text-align": "center",
              "font-weight": "700",
              "font-size": "1.1rem",
              "font-variant-numeric": "tabular-nums",
            }}
          >
            {count()}
          </span>
          <button onClick={inc} style={{ ...btnStyle, width: "36px", padding: "0.4rem" }}>
            +
          </button>
        </div>

        <div
          style={{
            background: "#f8fafc",
            "border-radius": "6px",
            border: "1px solid #e2e8f0",
            padding: "0.6rem 0.75rem",
            "min-height": "88px",
            "font-size": "0.85rem",
          }}
        >
          <Show
            when={log().length > 0}
            fallback={<span style={{ color: "#94a3b8" }}>No events yet…</span>}
          >
            <For each={log()}>
              {(entry, i) => (
                <div style={{ color: i() === 0 ? "#1e293b" : "#94a3b8", "line-height": "1.6" }}>
                  {entry}
                </div>
              )}
            </For>
          </Show>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Two channels — <code>greet</code> and <code>count</code> — share one emitter object.
        </p>
      </div>
    );
  },
});

export const EventHubStory = meta.story({
  name: "createEventHub",
  parameters: {
    docs: {
      description: {
        story:
          "`createEventHub(channels)` groups multiple event buses under one object. Access each channel individually (`hub.spin.listen`) or use the hub's unified `emit(channel, payload)` to fire any channel by name. The box below responds to `spin` and `wiggle` events sent from the hub.",
      },
    },
  },
  render: () => {
    const { emit, spin, wiggle } = createEventHub(_ => ({
      spin: _<number>(),
      wiggle: _<void>(),
    }));

    const [angle, setAngle] = createSignal(0);
    const [wiggling, setWiggling] = createSignal(false);

    spin.listen(deg => setAngle(a => a + deg));
    wiggle.listen(() => {
      setWiggling(true);
      setTimeout(() => setWiggling(false), 500);
    });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createEventHub</h3>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => emit("spin", 45)}
            style={{ ...btnStyle, flex: 1 }}
          >
            Spin +45°
          </button>
          <button
            onClick={() => emit("spin", -45)}
            style={{ ...btnStyle, flex: 1 }}
          >
            Spin −45°
          </button>
          <button
            onClick={() => emit("wiggle")}
            style={{ ...btnStyle, flex: 1 }}
          >
            Wiggle!
          </button>
        </div>

        <div
          style={{
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              width: "88px",
              height: "88px",
              "border-radius": "14px",
              background: wiggling() ? "#6366f1" : "#f97316",
              transform: `rotate(${angle()}deg) scale(${wiggling() ? 1.12 : 1})`,
              transition: "transform 0.3s ease, background 0.15s",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              color: "white",
              "font-weight": "700",
              "font-size": "0.8rem",
            }}
          >
            {((((angle() % 360) + 540) % 360) - 180)}°
          </div>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          <code>spin.listen</code> and <code>wiggle.listen</code> subscribe per-channel; buttons use
          the hub's unified <code>emit(channel, payload)</code>.
        </p>
      </div>
    );
  },
});

export const EventStackStory = meta.story({
  name: "createEventStack",
  parameters: {
    docs: {
      description: {
        story:
          "`createEventStack<E, V>()` maintains a reactive list of emitted events. Each `emit` prepends an item transformed by `toValue`. Items can be individually removed with `stack.remove(item)` or the whole stack cleared with `setValue([])`. Perfect for notification queues and toast stacks.",
      },
    },
  },
  render: () => {
    const stack = createEventStack<string, { id: number; text: string }>({
      toValue: (raw: string) => ({ id: Date.now() + Math.random(), text: raw.slice(0, 64) }),
      length: 8,
    });

    const [draft, setDraft] = createSignal("");

    const send = () => {
      const t = draft().trim();
      if (!t) return;
      stack.emit(t);
      setDraft("");
    };

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createEventStack</h3>

        <form
          onSubmit={e => {
            e.preventDefault();
            send();
          }}
          style={{ display: "flex", gap: "0.5rem" }}
        >
          <input
            value={draft()}
            onInput={e => setDraft(e.currentTarget.value)}
            placeholder="Type a message…"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button type="submit" style={btnStyle}>
            Send
          </button>
          <button
            type="button"
            onClick={() => stack.setValue([])}
            style={btnStyle}
          >
            Clear
          </button>
        </form>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.4rem", "min-height": "80px" }}>
          <Show
            when={stack.value().length > 0}
            fallback={
              <span style={{ color: "#94a3b8", "font-size": "0.85rem" }}>
                No notifications yet…
              </span>
            }
          >
            <For each={stack.value()}>
              {item => (
                <div
                  style={{
                    display: "flex",
                    "align-items": "center",
                    gap: "0.5rem",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    "border-radius": "6px",
                    padding: "0.45rem 0.75rem",
                    "font-size": "0.85rem",
                  }}
                >
                  <span style={{ flex: 1, color: "#334155" }}>{item.text}</span>
                  <button
                    onClick={() => stack.remove(item)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#94a3b8",
                      padding: "0 0.2rem",
                      "font-size": "1.1rem",
                      "line-height": 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </For>
          </Show>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Stack holds up to 8 items. <code>stack.remove(item)</code> removes one;{" "}
          <code>setValue([])</code> clears all.
        </p>
      </div>
    );
  },
});
