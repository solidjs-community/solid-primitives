import { createEffect, createSignal, onCleanup } from "solid-js";
import { Show } from "@solidjs/web";
import preview from "../../../.storybook/preview.js";
import {
  promiseTimeout,
  raceTimeout,
  until,
  changed,
  untilAll,
  untilAny,
  retry,
} from "../src/index.js";
import readme from "../README.md?raw";
import {
  Badge,
  BoolRow,
  Button,
  ButtonRow,
  Container,
  EventLog,
  ProgressBar,
  Section,
  StatRow,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Utilities/Promise",
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

export const DelayedResolveReject = meta.story({
  name: "Delayed resolve vs. reject",
  parameters: {
    docs: {
      description: {
        story:
          "`promiseTimeout(ms)` resolves after `ms` milliseconds. Pass `throwOnTimeout = true` to have it reject instead. Watch the progress bar fill — outcome shows once the 2 s window closes.",
      },
    },
  },
  render: () => {
    type Status = "idle" | "running" | "resolved" | "rejected";
    const [status, setStatus] = createSignal<Status>("idle");
    const [elapsed, setElapsed] = createSignal(0);
    const DURATION = 2000;
    let timer: ReturnType<typeof setInterval> | undefined;

    const start = (shouldReject: boolean) => {
      if (status() === "running") return;
      clearInterval(timer);
      setElapsed(0);
      setStatus("running");
      const t0 = Date.now();
      timer = setInterval(() => setElapsed(Math.min(Date.now() - t0, DURATION)), 50);
      promiseTimeout(DURATION, shouldReject).then(
        () => { clearInterval(timer); setStatus("resolved"); },
        () => { clearInterval(timer); setStatus("rejected"); },
      );
    };

    onCleanup(() => clearInterval(timer));

    return (
      <Container width={300}>
        <StatRow label="status" value={status()} />
        <Show when={status() === "running"}>
          <ProgressBar value={elapsed()} max={DURATION} />
        </Show>
        <ButtonRow>
          <Button onClick={() => start(false)} disabled={status() === "running"}>
            Resolve after 2 s
          </Button>
          <Button
            onClick={() => start(true)}
            disabled={status() === "running"}
            variant="secondary"
          >
            Reject after 2 s
          </Button>
        </ButtonRow>
        <Show when={status() === "resolved" || status() === "rejected"}>
          <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
            <Badge variant={status() === "resolved" ? "success" : "error"}>
              {status() === "resolved" ? "Promise resolved ✓" : "Promise rejected ✗"}
            </Badge>
            <Button onClick={() => setStatus("idle")} variant="ghost">
              Reset
            </Button>
          </div>
        </Show>
      </Container>
    );
  },
});

export const SlowOpVsTimeout = meta.story({
  name: "Slow op vs. timeout",
  parameters: {
    docs: {
      description: {
        story:
          "`raceTimeout` lets a promise compete against a timer. Slide the fetch delay above 2 s to see the timeout win; below 2 s the fetch wins. Without `throwOnTimeout`, the outer promise always resolves — it only rejects when you opt in.",
      },
    },
  },
  render: () => {
    const TIMEOUT_MS = 2000;
    const [delay, setDelay] = createSignal(1500);
    type Status = "idle" | "racing" | "fetch-won" | "timeout-won";
    const [status, setStatus] = createSignal<Status>("idle");
    const [elapsed, setElapsed] = createSignal(0);
    let timer: ReturnType<typeof setInterval> | undefined;

    const race = () => {
      if (status() === "racing") return;
      clearInterval(timer);
      setElapsed(0);
      setStatus("racing");
      const t0 = Date.now();
      const maxMs = Math.max(delay(), TIMEOUT_MS) + 100;
      timer = setInterval(() => setElapsed(Math.min(Date.now() - t0, maxMs)), 50);
      const fetchSim = promiseTimeout(delay());
      raceTimeout(fetchSim, TIMEOUT_MS).then(() => {
        clearInterval(timer);
        setStatus(delay() <= TIMEOUT_MS ? "fetch-won" : "timeout-won");
      });
    };

    onCleanup(() => clearInterval(timer));

    const maxBar = () => Math.max(delay(), TIMEOUT_MS);

    return (
      <Container width={320}>
        <StatRow label="fetch delay" value={`${delay()} ms`} />
        <StatRow label="timeout" value={`${TIMEOUT_MS} ms`} />
        <input
          type="range"
          min={200}
          max={3800}
          step={100}
          value={delay()}
          onInput={e => setDelay(Number(e.currentTarget.value))}
          disabled={status() === "racing"}
          style={{ width: "100%" }}
        />
        <Show when={status() === "racing"}>
          <ProgressBar value={elapsed()} max={maxBar()} label="elapsed" />
        </Show>
        <Button onClick={race} disabled={status() === "racing"}>
          Race
        </Button>
        <Show when={status() === "fetch-won" || status() === "timeout-won"}>
          <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
            <Badge variant={status() === "fetch-won" ? "success" : "warning"}>
              {status() === "fetch-won" ? "Fetch won ✓" : "Timeout won (resolved void)"}
            </Badge>
            <Button onClick={() => setStatus("idle")} variant="ghost">
              Reset
            </Button>
          </div>
        </Show>
      </Container>
    );
  },
});

export const ReactiveGateAsPromise = meta.story({
  name: "Reactive gate as promise",
  parameters: {
    docs: {
      description: {
        story:
          "`until(condition)` returns a promise that resolves with the first truthy value the reactive condition produces. Internally it creates a reactive computation that disposes itself on resolution — no cleanup boilerplate needed.",
      },
    },
  },
  render: () => {
    const THRESHOLD = 5;
    const [count, setCount] = createSignal(0);
    const [status, setStatus] = createSignal<"waiting" | "resolved">("waiting");
    const [resolvedWith, setResolvedWith] = createSignal<number | null>(null);

    const p = until(() => (count() >= THRESHOLD ? count() : false));
    p.then(v => { setResolvedWith(v as number); setStatus("resolved"); }, () => {});

    return (
      <Container width={300}>
        <StatRow label="count" value={count()} />
        <StatRow label="threshold" value={THRESHOLD} />
        <StatRow label="status" value={status()} />
        <ButtonRow>
          <Button onClick={() => setCount(c => c + 1)} disabled={status() === "resolved"}>
            Increment
          </Button>
          <Button
            onClick={() => setCount(0)}
            variant="ghost"
            disabled={status() === "resolved"}
          >
            Reset count
          </Button>
        </ButtonRow>
        <Show when={status() === "resolved"}>
          <Badge variant="success">Resolved with {resolvedWith()} ✓</Badge>
        </Show>
      </Container>
    );
  },
});

export const ResolveAfterNChanges = meta.story({
  name: "Resolve after N changes",
  parameters: {
    docs: {
      description: {
        story:
          "`changed(source, n)` wraps a reactive source and returns an accessor that becomes truthy only after the source has changed `n` times. Compose it with `until` to gate async work on a specific number of reactive updates.",
      },
    },
  },
  render: () => {
    const CHANGES_NEEDED = 3;
    const [count, setCount] = createSignal(0);
    const [changesDone, setChangesDone] = createSignal(0);
    const [status, setStatus] = createSignal<"waiting" | "resolved">("waiting");

    createEffect(
      () => count(),
      (_, prev) => {
        if (prev !== undefined) setChangesDone(c => c + 1);
      },
    );

    const p = until(changed(count, CHANGES_NEEDED));
    p.then(() => setStatus("resolved"), () => {});

    return (
      <Container width={300}>
        <StatRow label="count value" value={count()} />
        <StatRow label="changes" value={`${changesDone()} / ${CHANGES_NEEDED}`} />
        <StatRow label="status" value={status()} />
        <ButtonRow>
          <Button onClick={() => setCount(c => c + 1)} disabled={status() === "resolved"}>
            Change count
          </Button>
        </ButtonRow>
        <Show when={status() === "resolved"}>
          <Badge variant="success">Resolved after {CHANGES_NEEDED} changes ✓</Badge>
        </Show>
      </Container>
    );
  },
});

export const AllConditionsBeforeProceeding = meta.story({
  name: "All conditions before proceeding",
  parameters: {
    docs: {
      description: {
        story:
          "`untilAll([...conditions])` resolves only when every condition is simultaneously truthy — the reactive equivalent of `Promise.all`. Toggle the flags in any order; the promise fires when the last one flips.",
      },
    },
  },
  render: () => {
    const [auth, setAuth] = createSignal(false);
    const [data, setData] = createSignal(false);
    const [ready, setReady] = createSignal(false);
    const [status, setStatus] = createSignal<"waiting" | "resolved">("waiting");

    const p = untilAll([auth, data, ready]);
    p.then(() => setStatus("resolved"), () => {});

    const met = () => [auth(), data(), ready()].filter(Boolean).length;

    const ToggleRow = (rowProps: {
      label: string;
      value: () => boolean;
      onToggle: () => void;
    }) => (
      <div
        style={{
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center",
          gap: "0.5rem",
        }}
      >
        <BoolRow label={rowProps.label} value={rowProps.value()} />
        <Button
          onClick={rowProps.onToggle}
          variant="outline"
          disabled={status() === "resolved"}
          style={{ padding: "0.2rem 0.6rem", "font-size": "0.78rem" }}
        >
          toggle
        </Button>
      </div>
    );

    return (
      <Container width={300}>
        <StatRow label="met" value={`${met()} / 3`} />
        <StatRow label="status" value={status()} />
        <Section title="Conditions">
          <ToggleRow label="auth" value={auth} onToggle={() => setAuth(v => !v)} />
          <ToggleRow label="data loaded" value={data} onToggle={() => setData(v => !v)} />
          <ToggleRow label="UI ready" value={ready} onToggle={() => setReady(v => !v)} />
        </Section>
        <Show when={status() === "resolved"}>
          <Badge variant="success">All 3 conditions met — resolved ✓</Badge>
        </Show>
      </Container>
    );
  },
});

export const FirstConditionWins = meta.story({
  name: "First condition wins",
  parameters: {
    docs: {
      description: {
        story:
          "`untilAny([...conditions])` resolves with the first truthy value across all conditions — the reactive equivalent of `Promise.any`. Click any option; whichever fires first wins and the rest are ignored.",
      },
    },
  },
  render: () => {
    const [aTriggered, setATriggered] = createSignal(false);
    const [bTriggered, setBTriggered] = createSignal(false);
    const [cTriggered, setCTriggered] = createSignal(false);
    const [winner, setWinner] = createSignal<string | null>(null);

    const p = untilAny([
      () => (aTriggered() ? "Option A" : false),
      () => (bTriggered() ? "Option B" : false),
      () => (cTriggered() ? "Option C" : false),
    ]);
    p.then(v => setWinner(v as string), () => {});

    return (
      <Container width={300}>
        <StatRow label="winner" value={winner() ?? "—"} />
        <ButtonRow>
          <Button onClick={() => setATriggered(true)} disabled={winner() !== null}>
            Option A
          </Button>
          <Button
            onClick={() => setBTriggered(true)}
            disabled={winner() !== null}
            variant="secondary"
          >
            Option B
          </Button>
          <Button
            onClick={() => setCTriggered(true)}
            disabled={winner() !== null}
            variant="outline"
          >
            Option C
          </Button>
        </ButtonRow>
        <Show when={winner() !== null}>
          <Badge variant="success">{winner()} won the race ✓</Badge>
        </Show>
      </Container>
    );
  },
});

export const FlakyRequestAutoRetry = meta.story({
  name: "Flaky request with auto-retry",
  parameters: {
    docs: {
      description: {
        story:
          "`retry(fn, options)` calls `fn` up to `times` attempts. On failure it waits `delay` ms then tries again. Slide the failure rate up and watch the attempt log fill — once all retries are exhausted the promise rejects with the last error.",
      },
    },
  },
  render: () => {
    const [failRate, setFailRate] = createSignal(70);
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);
    type Status = "idle" | "running" | "succeeded" | "failed";
    const [status, setStatus] = createSignal<Status>("idle");

    const run = async () => {
      if (status() === "running") return;
      setStatus("running");
      setLog([]);
      let attempt = 0;
      try {
        await retry(
          async () => {
            attempt++;
            const time = new Date().toLocaleTimeString();
            if (Math.random() * 100 < failRate()) {
              setLog(prev =>
                [{ label: `✗ attempt ${attempt} — network error`, time }, ...prev].slice(0, 6),
              );
              throw new Error("Network error");
            }
            setLog(prev =>
              [{ label: `✓ attempt ${attempt} — success`, time }, ...prev].slice(0, 6),
            );
          },
          { times: 5, delay: 400 },
        );
        setStatus("succeeded");
      } catch {
        setStatus("failed");
      }
    };

    return (
      <Container width={340}>
        <StatRow label="failure rate" value={`${failRate()}%`} />
        <input
          type="range"
          min={0}
          max={95}
          step={5}
          value={failRate()}
          onInput={e => setFailRate(Number(e.currentTarget.value))}
          style={{ width: "100%" }}
        />
        <p style={{ margin: 0, "font-size": "0.78rem", color: "#64748b" }}>
          Up to 5 attempts · 400 ms between retries
        </p>
        <Button onClick={run} disabled={status() === "running"}>
          {status() === "running" ? "Running…" : "Run request"}
        </Button>
        <Show when={log().length > 0}>
          <EventLog entries={log()} />
        </Show>
        <Show when={status() === "succeeded" || status() === "failed"}>
          <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
            <Badge variant={status() === "succeeded" ? "success" : "error"}>
              {status() === "succeeded" ? "Succeeded ✓" : "Failed after 5 attempts ✗"}
            </Badge>
            <Button
              onClick={() => {
                setStatus("idle");
                setLog([]);
              }}
              variant="ghost"
            >
              Reset
            </Button>
          </div>
        </Show>
      </Container>
    );
  },
});
