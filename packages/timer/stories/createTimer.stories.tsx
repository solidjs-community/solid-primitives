import { createSignal, onCleanup } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { makeTimer, createTimer, createTimeoutLoop } from "@solid-primitives/timer";
import readme from "../README.md?raw";
import { container } from "./_helpers.js";
import { Stat, Button } from "../../../.storybook/ui/index.js";

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
      <div style={container}>
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
          Cleanup is manual — <code>onCleanup(makeTimer(...))</code> ties it to the component lifecycle.
        </p>
      </div>
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
      <div style={container}>
        <h3 style={{ margin: 0 }}>createTimer</h3>

        <Stat label="Ticks">{count()}</Stat>
        <Stat label="Delay">{delay() === false ? "paused" : `${delay()}ms`}</Stat>

        <div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
          {([250, 500, 1000, 2000] as const).map(ms => (
            <Button
              onClick={() => setDelay(ms)}
              variant={delay() === ms ? "primary" : "outline"}
            >
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
      </div>
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
      <div style={container}>
        <h3 style={{ margin: 0 }}>createTimeoutLoop</h3>

        <Stat label="Ticks">{count()}</Stat>
        <Stat label="Next delay">{delay() === false ? "paused" : `${delay()}ms`}</Stat>

        <div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
          {([250, 500, 1000, 2000] as const).map(ms => (
            <Button
              onClick={() => setDelay(ms)}
              variant={delay() === ms ? "primary" : "outline"}
            >
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
          Change the delay mid-tick — it takes effect on the <em>next</em> execution, not the current one.
        </p>
      </div>
    );
  },
});
