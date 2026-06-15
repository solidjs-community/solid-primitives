import { createSignal, For, isPending, Loading, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createWorker, createWorkerPool, createWorkerQuery, createReactiveWorker } from "@solid-primitives/workers";
import readme from "../README.md?raw";
import {
  Badge,
  Button,
  ButtonRow,
  Card,
  Container,
  Section,
  StatRow,
  colors,
  font,
  radii,
} from "../../../.storybook/ui/index.js";

// ─── Shared self-contained worker functions ───────────────────────────────────
// These are serialized via Function.prototype.toString — no closures or imports.

async function isPrime(n: number): Promise<boolean> {
  await new Promise(r => setTimeout(r, 500 + Math.floor(Math.random() * 2000)));
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

async function wait(ms: number): Promise<number> {
  await new Promise(r => setTimeout(r, ms));
  return ms;
}

// Fixed dataset for the reactive bridge story — deterministic across renders
const DATASET = [72, 45, 88, 31, 67, 94, 12, 55, 78, 23, 91, 46, 63, 17, 84,
                  39, 71, 58, 26, 97, 43, 69, 15, 82, 34, 76, 51, 28, 95, 62,
                  18, 87, 40, 73, 57, 29, 92, 48, 66, 21, 85, 36, 79, 53, 24,
                  98, 44, 70, 38, 60];

const POOL_NUMBERS = [982451653, 999999937, 104729, 524287, 1000000007, 32452843] as const;

const meta = preview.meta({
  title: "Browser APIs/Workers",
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

// ─── Story 1: Offloaded compute ──────────────────────────────────────────────

export const OffloadedCompute = meta.story({
  name: "Offloaded compute",
  parameters: {
    docs: {
      description: {
        story:
          "`createWorker` spawns a worker from an object of self-contained functions. Each method becomes a typed async RPC call. This example checks primality in the worker — the main thread stays unblocked while the computation runs.",
      },
    },
  },
  render: () => {
    const [worker] = createWorker({ isPrime });

    const [input, setInput] = createSignal(982451653);
    const [result, setResult] = createSignal<boolean | null>(null);
    const [elapsed, setElapsed] = createSignal<number | null>(null);
    const [busy, setBusy] = createSignal(false);

    const check = async () => {
      setBusy(true);
      setResult(null);
      const t0 = performance.now();
      const res = await worker.isPrime(input());
      setElapsed(Math.round(performance.now() - t0));
      setResult(res);
      setBusy(false);
    };

    return (
      <Container width={340}>
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
          <span style={{ "font-size": font.sizeSm, color: colors.muted }}>Number to test</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="number"
              value={input()}
              onInput={e => setInput(Number(e.currentTarget.value))}
              style={{
                flex: 1,
                padding: "0.4rem 0.6rem",
                border: `1px solid ${colors.border}`,
                "border-radius": radii.md,
                "font-size": font.sizeBase,
                "font-family": font.mono,
              }}
            />
            <Button onClick={check} disabled={busy()}>
              {busy() ? "Checking…" : "Check"}
            </Button>
          </div>
        </div>

        <Card>
          <Show when={result() !== null} fallback={
            <span style={{ color: colors.mutedFg, "font-size": font.sizeSm }}>
              {busy() ? "Running in worker…" : "Enter a number and click Check"}
            </span>
          }>
            <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
              <Badge variant={result() ? "success" : "error"}>
                {result() ? "Prime" : "Not prime"}
              </Badge>
              <span style={{ "font-size": font.sizeSm, color: colors.muted }}>
                {elapsed()}ms
              </span>
            </div>
          </Show>
        </Card>

        <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.mutedFg }}>
          Worker functions are serialized — they must be self-contained with no imports or closures.
        </p>
      </Container>
    );
  },
});

// ─── Story 2: Pool round-robin ───────────────────────────────────────────────

type TaskState = { n: number; state: "idle" | "running" | "done"; prime?: boolean; ms?: number };

export const PoolRoundRobin = meta.story({
  name: "Pool round-robin",
  parameters: {
    docs: {
      description: {
        story:
          "`createWorkerPool(n, fns)` spawns `n` workers and distributes calls across them via round-robin. All six checks are dispatched simultaneously — the pool of 3 workers handles them in parallel.",
      },
    },
  },
  render: () => {
    const [pool] = createWorkerPool(3, { isPrime });

    const initial: TaskState[] = POOL_NUMBERS.map(n => ({ n, state: "idle" }));
    const [tasks, setTasks] = createSignal<TaskState[]>(initial);

    const runAll = () => {
      setTasks(POOL_NUMBERS.map(n => ({ n, state: "running" })));
      POOL_NUMBERS.forEach((n, i) => {
        const t0 = performance.now();
        pool.isPrime(n).then(prime => {
          setTasks(prev =>
            prev.map((t, j) =>
              j === i ? { ...t, state: "done", prime, ms: Math.round(performance.now() - t0) } : t,
            ),
          );
        });
      });
    };

    const allDone = () => tasks().every(t => t.state === "done");
    const anyRunning = () => tasks().some(t => t.state === "running");

    return (
      <Container width={340}>
        <div style={{ display: "flex", "align-items": "center", "justify-content": "space-between" }}>
          <span style={{ "font-size": font.sizeSm, color: colors.muted }}>
            3-worker pool · {POOL_NUMBERS.length} tasks
          </span>
          <ButtonRow>
            <Button onClick={runAll} disabled={anyRunning()} variant={allDone() ? "outline" : "primary"}>
              {anyRunning() ? "Running…" : allDone() ? "Re-run" : "Run all"}
            </Button>
          </ButtonRow>
        </div>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
          <For each={tasks()}>
            {task => (
              <div style={{
                display: "flex",
                "align-items": "center",
                "justify-content": "space-between",
                padding: "0.4rem 0.6rem",
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                "border-radius": radii.md,
                "font-size": font.sizeSm,
              }}>
                <code style={{ "font-family": font.mono }}>{task.n.toLocaleString()}</code>
                <div style={{ display: "flex", "align-items": "center", gap: "0.5rem" }}>
                  <Show when={task.state === "done"}>
                    <Badge variant={task.prime ? "success" : "error"}>
                      {task.prime ? "prime" : "not prime"}
                    </Badge>
                    <span style={{ color: colors.mutedFg, "font-family": font.mono }}>
                      {task.ms}ms
                    </span>
                  </Show>
                  <Show when={task.state === "running"}>
                    <span style={{ color: colors.warning }}>⟳</span>
                  </Show>
                  <Show when={task.state === "idle"}>
                    <span style={{ color: colors.mutedFg }}>—</span>
                  </Show>
                </div>
              </div>
            )}
          </For>
        </div>
      </Container>
    );
  },
});

// ─── Story 3: Auto-refreshing query ─────────────────────────────────────────

export const AutoRefreshingQuery = meta.story({
  name: "Auto-refreshing query",
  parameters: {
    docs: {
      description: {
        story:
          "`createWorkerQuery(fn)` wraps a worker call in an async `createMemo`. It re-runs whenever reactive inputs change. `<Loading>` covers the initial load; `isPending` detects subsequent revalidations so the stale result stays visible with a refresh indicator.",
      },
    },
  },
  render: () => {
    const [worker] = createWorker({ wait });
    const [delay, setDelay] = createSignal(1000);
    const result = createWorkerQuery(() => worker.wait(delay()));
    const refreshing = () => isPending(() => result());

    return (
      <Container width={340}>
        <Section title="Delay (ms)">
          <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
            <input
              type="range"
              min={500}
              max={2500}
              step={100}
              value={delay()}
              onInput={e => setDelay(Number(e.currentTarget.value))}
              style={{ flex: 1 }}
            />
            <code style={{
              "font-family": font.mono,
              "font-size": font.sizeBase,
              "min-width": "3.5rem",
              "text-align": "right",
            }}>
              {delay()}ms
            </code>
          </div>
        </Section>

        <Card>
          <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
            <span style={{ "font-size": font.sizeSm, color: colors.muted }}>Worker echoed</span>
            <Show when={refreshing()}>
              <Badge variant="warning">Refreshing…</Badge>
            </Show>
          </div>
          <Loading fallback={
            <span style={{ color: colors.warning, "font-family": font.mono }}>
              Waiting {delay()}ms…
            </span>
          }>
            <span style={{
              "font-size": "1.5rem",
              "font-weight": "700",
              "font-family": font.mono,
              color: colors.primary,
            }}>
              {result()}ms
            </span>
          </Loading>
        </Card>

        <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.mutedFg }}>
          Drag the slider to change the delay. The stale value stays visible with a{" "}
          <strong>Refreshing…</strong> badge until the worker resolves.
        </p>
      </Container>
    );
  },
});

// ─── Story 4: Reactive store bridge ─────────────────────────────────────────

export const ReactiveStoreBridge = meta.story({
  name: "Reactive store bridge",
  parameters: {
    docs: {
      description: {
        story:
          "`createReactiveWorker` bridges Solid stores across the thread boundary. `setInputs` changes deep-track and sync to the worker automatically; `outputs` updates whenever the worker writes new values. The companion `workerScope` gives the worker its own reactive graph.",
      },
    },
  },
  render: () => {
    const { inputs, setInputs, outputs, error } = createReactiveWorker(
      new URL("./stats.worker.ts", import.meta.url),
      {
        inputs: { values: DATASET, threshold: 50 },
        outputs: { count: 0, mean: 0, max: 0 },
      },
    );

    return (
      <Container width={340}>
        <Show when={error()} keyed>
          {ev => (
            <div style={{
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              "border-radius": radii.md,
              padding: "0.6rem 0.8rem",
              "font-size": font.sizeSm,
              color: "#dc2626",
            }}>
              Worker error: {ev.message}
            </div>
          )}
        </Show>

        <Section title="Input — threshold">
          <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
            <input
              type="range"
              min={0}
              max={100}
              value={(inputs as any).threshold}
              onInput={e => setInputs(s => { (s as any).threshold = Number(e.currentTarget.value); })}
              style={{ flex: 1 }}
            />
            <code style={{
              "font-family": font.mono,
              "font-size": font.sizeBase,
              "min-width": "2rem",
              "text-align": "right",
            }}>
              {(inputs as any).threshold}
            </code>
          </div>
        </Section>

        <Section title="Outputs — computed in worker">
          <StatRow label="Above threshold" value={outputs.count} />
          <StatRow label="Mean" value={outputs.mean} />
          <StatRow label="Max" value={outputs.max} />
        </Section>

        <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.mutedFg }}>
          Dataset: {DATASET.length} integers (1–100). Filtering and stats computed reactively inside the worker.
        </p>
      </Container>
    );
  },
});
