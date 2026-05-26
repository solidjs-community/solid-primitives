import { createEffect, createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  debounce,
  throttle,
  leading,
  leadingAndTrailing,
  createScheduled,
} from "@solid-primitives/scheduled";
import readme from "../README.md?raw";
import { container } from "./_helpers.js";
import { StatRow, EventLog, Button as Btn } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Utilities/Scheduled",
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

export const DebounceStory = meta.story({
  name: "Debounce (debounce)",
  parameters: {
    docs: {
      description: {
        story:
          "`debounce` delays invoking the callback until after `wait` ms have elapsed since the last call. Useful for search inputs, resize handlers, or any rapid-fire event where only the final value matters.",
      },
    },
  },
  render: () => {
    const [raw, setRaw] = createSignal("");
    const [debounced, setDebounced] = createSignal("—");
    const [callCount, setCallCount] = createSignal(0);
    const [fireCount, setFireCount] = createSignal(0);

    const update = debounce((val: string) => {
      setDebounced(val || "—");
      setFireCount(n => n + 1);
    }, 600);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>debounce (600 ms trailing)</h3>

        <input
          type="text"
          placeholder="Type something…"
          value={raw()}
          onInput={e => {
            const val = e.currentTarget.value;
            setRaw(val);
            setCallCount(n => n + 1);
            update(val);
          }}
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            border: "1px solid #e2e8f0",
            "border-radius": "6px",
            "font-size": "0.95rem",
            "box-sizing": "border-box",
            "font-family": "system-ui",
          }}
        />

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
          <StatRow label="Raw value" value={raw() || "—"} />
          <StatRow label="Debounced value" value={debounced()} />
          <StatRow label="onInput calls" value={callCount()} />
          <StatRow label="Callback fires" value={fireCount()} />
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          The debounced value only updates 600 ms after you stop typing.
        </p>
      </div>
    );
  },
});

export const ThrottleStory = meta.story({
  name: "Throttle (throttle)",
  parameters: {
    docs: {
      description: {
        story:
          "`throttle` ensures the callback fires at most once per `wait` ms — on the **trailing** edge. Subsequent calls within the window are dropped (only the last args are used). Use `leading()` to fire on the first call instead.",
      },
    },
  },
  render: () => {
    const [rawCount, setRawCount] = createSignal(0);
    const [throttledCount, setThrottledCount] = createSignal(0);
    const [lastFiredAt, setLastFiredAt] = createSignal("—");

    const throttled = throttle(() => {
      setThrottledCount(n => n + 1);
      setLastFiredAt(new Date().toLocaleTimeString());
    }, 800);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>throttle (800 ms trailing)</h3>

        <Btn
          onClick={() => {
            setRawCount(n => n + 1);
            throttled();
          }}
        >
          Click me rapidly
        </Btn>

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
          <StatRow label="Button clicks" value={rawCount()} />
          <StatRow label="Callback fires" value={throttledCount()} />
          <StatRow label="Last fired at" value={lastFiredAt()} />
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Click rapidly — the callback fires at most once every 800 ms.
        </p>
      </div>
    );
  },
});

export const LeadingStory = meta.story({
  name: "Leading edge (leading / leadingAndTrailing)",
  parameters: {
    docs: {
      description: {
        story:
          "`leading(schedule, fn, wait)` wraps any `ScheduleCallback` to fire on the **leading** edge instead of trailing. `leadingAndTrailing` fires immediately on the first call, then again at the trailing edge if called more than once during the wait window.",
      },
    },
  },
  render: () => {
    const [trailingFires, setTrailingFires] = createSignal<string[]>([]);
    const [leadingFires, setLeadingFires] = createSignal<string[]>([]);
    const [leadTrailFires, setLeadTrailFires] = createSignal<string[]>([]);

    const now = () => new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const trailingFn = throttle(() => setTrailingFires(p => [now(), ...p].slice(0, 5)), 1000);
    const leadingFn = leading(throttle, () => setLeadingFires(p => [now(), ...p].slice(0, 5)), 1000);
    const leadTrailFn = leadingAndTrailing(throttle, () => setLeadTrailFires(p => [now(), ...p].slice(0, 5)), 1000);

    const logStyle = {
      background: "#0f172a",
      "border-radius": "6px",
      padding: "0.5rem 0.75rem",
      "min-height": "70px",
      display: "flex",
      "flex-direction": "column",
      gap: "0.2rem",
    };

    const logEntry = (s: string, i: number) => (
      <span
        style={{
          "font-family": "monospace",
          "font-size": "0.75rem",
          color: i === 0 ? "#a5f3fc" : "#475569",
        }}
      >
        {s}
      </span>
    );

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>Leading edge (1 s window)</h3>

        <div style={{ display: "grid", "grid-template-columns": "1fr 1fr 1fr", gap: "0.5rem" }}>
          <div style={{ display: "flex", "flex-direction": "column", gap: "0.4rem" }}>
            <Btn onClick={() => trailingFn()}>Trailing</Btn>
            <div style={logStyle}>
              {trailingFires().length === 0 ? (
                <span style={{ color: "#475569", "font-size": "0.72rem", "font-family": "monospace" }}>—</span>
              ) : (
                trailingFires().map(logEntry)
              )}
            </div>
          </div>

          <div style={{ display: "flex", "flex-direction": "column", gap: "0.4rem" }}>
            <Btn onClick={() => leadingFn()}>Leading</Btn>
            <div style={logStyle}>
              {leadingFires().length === 0 ? (
                <span style={{ color: "#475569", "font-size": "0.72rem", "font-family": "monospace" }}>—</span>
              ) : (
                leadingFires().map(logEntry)
              )}
            </div>
          </div>

          <div style={{ display: "flex", "flex-direction": "column", gap: "0.4rem" }}>
            <Btn onClick={() => leadTrailFn()}>Both</Btn>
            <div style={logStyle}>
              {leadTrailFires().length === 0 ? (
                <span style={{ color: "#475569", "font-size": "0.72rem", "font-family": "monospace" }}>—</span>
              ) : (
                leadTrailFires().map(logEntry)
              )}
            </div>
          </div>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Click each button multiple times quickly and observe when the timestamp is logged.
          <b> Trailing</b> fires after the window. <b>Leading</b> fires at the first call.{" "}
          <b>Both</b> fires at first call and again at the trailing edge if re-triggered.
        </p>
      </div>
    );
  },
});

export const CreateScheduledStory = meta.story({
  name: "Reactive scheduling (createScheduled)",
  parameters: {
    docs: {
      description: {
        story:
          "`createScheduled` bridges the gap between reactive computations and time-based scheduling. It returns a gate accessor that returns `true` only when the scheduled flush has fired — enabling you to batch reactive updates on a debounce/throttle window.",
      },
    },
  },
  render: () => {
    const [count, setCount] = createSignal(0);
    const [scheduledCount, setScheduledCount] = createSignal(0);
    const [flushCount, setFlushCount] = createSignal(0);

    const debounced = createScheduled(fn => debounce(fn, 800));

    createEffect(
      () => {
        const n = count();
        const isDirty = debounced();
        return { n, isDirty };
      },
      ({ n, isDirty }) => {
        if (isDirty) {
          setScheduledCount(n);
          setFlushCount(f => f + 1);
        }
      },
    );

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createScheduled (800 ms debounce)</h3>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Btn onClick={() => setCount(n => n + 1)}>Increment count</Btn>
          <Btn variant="secondary" onClick={() => { setCount(0); setScheduledCount(0); setFlushCount(0); }}>
            Reset
          </Btn>
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
          <StatRow label="count (raw)" value={count()} />
          <StatRow label="scheduledCount (debounced)" value={scheduledCount()} />
          <StatRow label="Scheduled flushes" value={flushCount()} />
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Click rapidly — <code>scheduledCount</code> only catches up 800 ms after the last
          increment. Each catch-up is one flush.
        </p>
      </div>
    );
  },
});
