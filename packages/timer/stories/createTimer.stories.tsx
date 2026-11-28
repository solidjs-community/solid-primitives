import { createSignal, onCleanup } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  makeTimer,
  createTimer,
  createTimeoutLoop,
  createPausableTimer,
} from "@solid-primitives/timer";
import readme from "../README.md?raw";
import { Stat, Button, Container } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Browser APIs/Timer",
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

export const MakeTimer = meta.story({
  name: "Manual timer",
  parameters: {
    docs: {
      description: {
        story:
          "`makeTimer` creates a `setTimeout` or `setInterval` and returns a function to clear it. No reactive lifecycle — the caller is responsible for cleanup (e.g. pass to `onCleanup`).",
      },
    },
  },
  render: () => {
    const [count, setCount] = createSignal(0);
    const [running, setRunning] = createSignal(false);
    let clear: VoidFunction | undefined;

    const start = () => {
      if (running()) return;
      clear = makeTimer(() => setCount(c => c + 1), 500, setInterval);
      setRunning(true);
    };

    const stop = () => {
      clear?.();
      clear = undefined;
      setRunning(false);
    };

    onCleanup(() => clear?.());

    return (
      <Container minWidth={320}>
        <h3 style={{ margin: 0 }}>makeTimer</h3>

        <Stat label="Ticks">{count()}</Stat>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button onClick={start} disabled={running()}>
            Start (500ms)
          </Button>
          <Button onClick={stop} disabled={!running()} variant="outline">
            Stop
          </Button>
          <Button onClick={() => setCount(0)} variant="outline">
            Reset
          </Button>
        </div>

        <p style={{ "font-size": "0.8rem", color: "#64748b", margin: 0 }}>
          Cleanup is manual — <code>onCleanup(makeTimer(...))</code> ties it to the component
          lifecycle.
        </p>
      </Container>
    );
  },
});

export const CreateTimerStory = meta.story({
  name: "Reactive interval",
  parameters: {
    docs: {
      description: {
        story:
          "`createTimer` wraps `makeTimer` in the reactive lifecycle. Pass a reactive accessor as the delay to change the interval on the fly — elapsed fraction carries forward so ticks stay smooth.",
      },
    },
  },
  render: () => {
    const [delay, setDelay] = createSignal<number | false>(1000);
    const [count, setCount] = createSignal(0);

    createTimer(() => setCount(c => c + 1), delay, setInterval);

    return (
      <Container minWidth={320}>
        <h3 style={{ margin: 0 }}>createTimer</h3>

        <Stat label="Ticks">{count()}</Stat>
        <Stat label="Delay">{delay() === false ? "paused" : `${delay()}ms`}</Stat>

        <div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
          {([250, 500, 1000, 2000] as const).map(ms => (
            <Button onClick={() => setDelay(ms)} variant={delay() === ms ? "primary" : "outline"}>
              {ms}ms
            </Button>
          ))}
          <Button
            onClick={() => setDelay(false)}
            variant={delay() === false ? "primary" : "outline"}
          >
            Pause
          </Button>
        </div>
      </Container>
    );
  },
});

export const CreateTimeoutLoop = meta.story({
  name: "Between-tick loop",
  parameters: {
    docs: {
      description: {
        story:
          "`createTimeoutLoop` is like `createTimer` with `setInterval`, but the new delay only takes effect between executions — mid-tick delay changes don't affect the current interval.",
      },
    },
  },
  render: () => {
    const [delay, setDelay] = createSignal<number | false>(1000);
    const [count, setCount] = createSignal(0);

    createTimeoutLoop(() => setCount(c => c + 1), delay);

    return (
      <Container minWidth={320}>
        <h3 style={{ margin: 0 }}>createTimeoutLoop</h3>

        <Stat label="Ticks">{count()}</Stat>
        <Stat label="Next delay">{delay() === false ? "paused" : `${delay()}ms`}</Stat>

        <div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
          {([250, 500, 1000, 2000] as const).map(ms => (
            <Button onClick={() => setDelay(ms)} variant={delay() === ms ? "primary" : "outline"}>
              {ms}ms
            </Button>
          ))}
          <Button
            onClick={() => setDelay(false)}
            variant={delay() === false ? "primary" : "outline"}
          >
            Pause
          </Button>
        </div>

        <p style={{ "font-size": "0.8rem", color: "#64748b", margin: 0 }}>
          Change the delay mid-tick — it takes effect on the <em>next</em> execution, not the
          current one.
        </p>
      </Container>
    );
  },
});

export const PausableTimer = meta.story({
  name: "Pausable toast",
  parameters: {
    docs: {
      description: {
        story:
          "`createPausableTimer` keeps the remaining time across pause/resume. Hover or focus the toast to pause it; leaving resumes with what was left, not the full delay.",
      },
    },
  },
  render: () => {
    const [dismissed, setDismissed] = createSignal(0);
    const [now, setNow] = createSignal(0);
    const timer = createPausableTimer(() => setDismissed(d => d + 1), 5000, {
      pauseWhenHidden: true,
    });
    const id = setInterval(() => setNow(n => n + 1), 100);
    onCleanup(() => clearInterval(id));

    return (
      <Container minWidth={320}>
        <h3 style={{ margin: 0 }}>createPausableTimer</h3>

        <div
          tabindex={0}
          role="status"
          style={{ padding: "1rem", border: "1px solid #cbd5e1", "border-radius": "0.5rem" }}
          onPointerEnter={timer.pause}
          onPointerLeave={timer.resume}
          onFocusIn={timer.pause}
          onFocusOut={timer.resume}
        >
          Hover or focus me
        </div>

        <Stat label="Remaining">{(now(), Math.round(timer.remaining()))}ms</Stat>
        <Stat label="State">
          {timer.isPaused() ? "paused" : timer.isActive() ? "running" : "idle"}
        </Stat>
        <Stat label="Dismissed">{dismissed()}</Stat>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button onClick={timer.start}>Restart</Button>
          <Button onClick={timer.reset} variant="outline">
            Reset
          </Button>
        </div>
      </Container>
    );
  },
});
