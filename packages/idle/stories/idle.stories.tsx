import { createSignal, onCleanup, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createIdleTimer } from "@solid-primitives/idle";
import readme from "../README.md?raw";
import {
  Badge,
  BoolRow,
  Button,
  ButtonRow,
  Card,
  colors,
  Container,
  EventLog,
  font,
  ProgressBar,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Browser APIs/Idle",
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

export const StateFlowStory = meta.story({
  name: "Active → prompted → idle",
  parameters: {
    docs: {
      description: {
        story:
          "`createIdleTimer` cycles through three mutually exclusive states. Move the mouse or press a key to stay active. After 4 s of inactivity the prompt phase begins (`isPrompted = true`); after 3 more seconds it flips to idle (`isIdle = true`). Calling `reset()` returns immediately to active from any state.",
      },
    },
  },
  render: () => {
    const IDLE_TIMEOUT = 4_000;
    const PROMPT_TIMEOUT = 3_000;

    // Mirror the same events createIdleTimer listens to so the bar is always in sync.
    const ACTIVITY_EVENTS = [
      "mousemove",
      "keydown",
      "wheel",
      "mousedown",
      "pointerdown",
      "touchstart",
      "touchmove",
      "visibilitychange",
    ] as const;

    const [elapsed, setElapsed] = createSignal(0);
    let lastActivity = Date.now();

    const onActivity = () => {
      lastActivity = Date.now();
    };
    for (const evt of ACTIVITY_EVENTS) document.addEventListener(evt, onActivity);
    onCleanup(() => {
      for (const evt of ACTIVITY_EVENTS) document.removeEventListener(evt, onActivity);
    });

    const iv = setInterval(() => setElapsed(Date.now() - lastActivity), 80);
    onCleanup(() => clearInterval(iv));

    const { isIdle, isPrompted, reset } = createIdleTimer({
      idleTimeout: IDLE_TIMEOUT,
      promptTimeout: PROMPT_TIMEOUT,
    });

    const status = () => (isIdle() ? "idle" : isPrompted() ? "prompted" : "active");
    const badgeVariant = (): "error" | "warning" | "success" =>
      isIdle() ? "error" : isPrompted() ? "warning" : "success";
    const barColor = () =>
      isIdle() ? "#ef4444" : isPrompted() ? colors.warning : colors.primary;

    const handleReset = () => {
      reset();
      lastActivity = Date.now();
      setElapsed(0);
    };

    return (
      <Container width={280}>
        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
          }}
        >
          <span style={{ "font-size": font.sizeBase, color: colors.muted }}>Status</span>
          <Badge variant={badgeVariant()}>{status()}</Badge>
        </div>
        <BoolRow label="isIdle" value={isIdle()} />
        <BoolRow label="isPrompted" value={isPrompted()} />
        <ProgressBar
          value={elapsed()}
          max={IDLE_TIMEOUT}
          label="idle countdown"
          color={barColor()}
        />
        <Button onClick={handleReset} variant="outline" style={{ width: "100%" }}>
          Reset timer
        </Button>
        <p style={{ margin: 0, "font-size": "0.78rem", color: colors.mutedFg }}>
          Bar fills as inactivity accumulates — any mouse or keyboard event resets it, as does
          the Reset button.
        </p>
      </Container>
    );
  },
});

export const SessionWarningStory = meta.story({
  name: '"Are you still there?" prompt',
  parameters: {
    docs: {
      description: {
        story:
          'A session-lock UX pattern: after `idleTimeout` the user sees a prompt card. If they confirm presence via `reset()`, the timer restarts. If they do not respond within `promptTimeout`, `isIdle` becomes true and the session locks. Note that user activity during the prompt phase does **not** dismiss it — only `reset()`, `stop()`, or `triggerIdle()` can.',
      },
    },
  },
  render: () => {
    const { isIdle, isPrompted, reset, triggerIdle } = createIdleTimer({
      idleTimeout: 4_000,
      promptTimeout: 5_000,
    });

    return (
      <Container width={300}>
        <Show when={isIdle()}>
          <Card>
            <div style={{ "text-align": "center" }}>
              <div style={{ "font-size": "1.5rem", "margin-bottom": "0.25rem" }}>🔒</div>
              <p
                style={{
                  margin: "0 0 0.75rem",
                  "font-size": font.sizeBase,
                  color: colors.muted,
                }}
              >
                Session locked due to inactivity.
              </p>
              <Button onClick={reset}>Unlock</Button>
            </div>
          </Card>
        </Show>
        <Show when={isPrompted() && !isIdle()}>
          <Card>
            <p style={{ margin: 0, "font-size": font.sizeBase, "font-weight": "600" }}>
              Are you still there?
            </p>
            <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.muted }}>
              Your session will lock in a few seconds.
            </p>
            <ButtonRow>
              <Button onClick={reset} style={{ flex: "1" }}>
                Yes, I'm here
              </Button>
              <Button onClick={triggerIdle} variant="outline" style={{ flex: "1" }}>
                Lock now
              </Button>
            </ButtonRow>
          </Card>
        </Show>
        <Show when={!isIdle() && !isPrompted()}>
          <div
            style={{
              "text-align": "center",
              color: colors.mutedFg,
              "font-size": font.sizeSm,
              padding: "1rem 0",
              "line-height": "1.6",
            }}
          >
            Active — move mouse or type to stay active.
            <br />
            Prompt after 4 s, locks after 5 more.
          </div>
        </Show>
      </Container>
    );
  },
});

export const ManualControlsStory = meta.story({
  name: "Manual start & callbacks",
  parameters: {
    docs: {
      description: {
        story:
          "With `startManually: true` the timer does not attach listeners on mount — `start()` must be called explicitly. All four control methods are shown: `start()`, `stop()`, `reset()`, and `triggerIdle()`. The log captures every callback invocation. **Quick test:** click **start** then **triggerIdle** to see `onIdle` fire immediately; move the mouse afterward to see `onActive`.",
      },
    },
  },
  render: () => {
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);
    const [started, setStarted] = createSignal(false);

    const addLog = (label: string) =>
      setLog(prev => [{ label, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 6));

    const { isIdle, isPrompted, start, stop, reset, triggerIdle } = createIdleTimer({
      idleTimeout: 2_000,
      promptTimeout: 1_500,
      startManually: true,
      onPrompt: () => addLog("onPrompt"),
      onIdle: () => addLog("onIdle"),
      onActive: evt => addLog(`onActive (${evt.type})`),
    });

    const handleStart = () => {
      start();
      setStarted(true);
      addLog("→ start()");
    };

    const handleStop = () => {
      stop();
      setStarted(false);
      addLog("→ stop()");
    };

    return (
      <Container width={320}>
        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
          }}
        >
          <span style={{ "font-size": font.sizeBase, color: colors.muted }}>Timer</span>
          <Badge variant={started() ? "success" : "default"}>
            {started() ? "running" : "stopped"}
          </Badge>
        </div>
        <BoolRow label="isIdle" value={isIdle()} />
        <BoolRow label="isPrompted" value={isPrompted()} />
        <ButtonRow>
          <Button onClick={handleStart} disabled={started()} style={{ flex: "1" }}>
            start
          </Button>
          <Button onClick={handleStop} disabled={!started()} variant="outline" style={{ flex: "1" }}>
            stop
          </Button>
          <Button onClick={reset} variant="outline" style={{ flex: "1" }}>
            reset
          </Button>
          <Button onClick={triggerIdle} variant="ghost" style={{ flex: "1" }}>
            triggerIdle
          </Button>
        </ButtonRow>
        <EventLog entries={log()} />
        <p style={{ margin: 0, "font-size": "0.78rem", color: colors.mutedFg }}>
          After starting, hold still for 2 s to see the prompt phase, then 1.5 s more for idle.
          Mouse events are tracked across the full page.
        </p>
      </Container>
    );
  },
});
