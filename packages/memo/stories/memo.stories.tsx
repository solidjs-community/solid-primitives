import { createMemo, createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createWritableMemo,
  createLazyMemo,
  createLatest,
  createLatestMany,
  createReducer,
  createMemoCache,
} from "@solid-primitives/memo";
import readme from "../README.md?raw";
import { StatRow, Card, Separator as Divider, ButtonRow, Button, Container } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/Memo",
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

export const WritableMemo = meta.story({
  name: "Writable memo (createWritableMemo)",
  parameters: {
    docs: {
      description: {
        story:
          "`createWritableMemo` works like `createMemo` but also returns a setter. Calling the setter overrides the computed value until the memo's reactive dependencies change again — at which point the computation resumes.",
      },
    },
  },
  render: () => {
    const [base, setBase] = createSignal(5);
    const [multiplier, setMultiplier] = createSignal(3);
    const [result, setResult] = createWritableMemo(() => base() * multiplier());

    return (
      <Container>
        <h3 style={{ margin: 0 }}>createWritableMemo</h3>

        <Card>
          <StatRow label="base" value={base()} />
          <StatRow label="multiplier" value={multiplier()} />
          <Divider />
          <StatRow label="result (base × multiplier)" value={result()} />
        </Card>

        <ButtonRow>
          <Button onClick={() => setBase(b => b + 1)}>base +1</Button>
          <Button onClick={() => setMultiplier(m => m + 1)}>multiplier +1</Button>
        </ButtonRow>

        <ButtonRow>
          <Button onClick={() => setResult(99)} variant="outline">Override → 99</Button>
          <Button onClick={() => setResult(0)} variant="outline">Override → 0</Button>
        </ButtonRow>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Override the result with the setter, then change <code>base</code> or{" "}
          <code>multiplier</code> — the reactive computation resumes automatically.
        </p>
      </Container>
    );
  },
});

export const LazyMemo = meta.story({
  name: "Lazy memo with accumulation (createLazyMemo)",
  parameters: {
    docs: {
      description: {
        story:
          "`createLazyMemo` is a lazily-evaluated memo that skips computation when it has no observers. The `prev` parameter enables accumulation — here it keeps a running triangular sum: T(n) = T(n-1) + n.",
      },
    },
  },
  render: () => {
    const [n, setN] = createSignal(0);

    const triangleNumber = createLazyMemo<number>(prev => (prev ?? 0) + n());

    return (
      <Container>
        <h3 style={{ margin: 0 }}>createLazyMemo — triangular sum</h3>

        <Card>
          <StatRow label="n" value={n()} />
          <StatRow label="T(n) = T(n-1) + n" value={triangleNumber()} />
          <Divider />
          <StatRow label="expected n*(n+1)/2" value={(n() * (n() + 1)) / 2} />
        </Card>

        <ButtonRow>
          <Button onClick={() => setN(v => v + 1)}>n++</Button>
          <Button onClick={() => setN(0)} variant="outline">Reset</Button>
        </ButtonRow>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Each increment passes the previous computed value through <code>prev</code>, accumulating
          a running total. T(n) always equals n*(n+1)/2 — verify by incrementing several times.
        </p>
      </Container>
    );
  },
});

export const Latest = meta.story({
  name: "Latest source (createLatest / createLatestMany)",
  parameters: {
    docs: {
      description: {
        story:
          "`createLatest` returns the value of whichever source updated last. `createLatestMany` returns *all* sources that changed in the same reactive flush — demonstrated here by updating two memos from the same upstream signal.",
      },
    },
  },
  render: () => {
    const [countA, setCountA] = createSignal(0);
    const [countB, setCountB] = createSignal(0);
    const [shared, setShared] = createSignal(0);

    const derivedA = createMemo(() => shared() * 2);
    const derivedB = createMemo(() => shared() * 3);

    const latest = createLatest([countA, countB]);
    const latestMany = createLatestMany([derivedA, derivedB]);

    return (
      <Container>
        <h3 style={{ margin: 0 }}>createLatest</h3>

        <Card>
          <StatRow label="A" value={countA()} />
          <StatRow label="B" value={countB()} />
          <Divider />
          <StatRow label="createLatest([A, B])" value={String(latest())} />
        </Card>

        <ButtonRow>
          <Button onClick={() => setCountA(c => c + 1)}>A++</Button>
          <Button onClick={() => setCountB(c => c + 1)}>B++</Button>
        </ButtonRow>

        <h3 style={{ margin: 0 }}>createLatestMany</h3>

        <Card>
          <StatRow label="shared" value={shared()} />
          <StatRow label="derivedA (×2)" value={derivedA()} />
          <StatRow label="derivedB (×3)" value={derivedB()} />
          <Divider />
          <StatRow label="createLatestMany([A, B])" value={JSON.stringify(latestMany())} />
        </Card>

        <Button onClick={() => setShared(s => s + 1)}>shared++ (updates both memos)</Button>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          When <code>shared</code> changes, both derived memos update in the same flush —{" "}
          <code>createLatestMany</code> captures both values. Updating A or B individually returns a
          single-element array.
        </p>
      </Container>
    );
  },
});

export const Reducer = meta.story({
  name: "Reducer (createReducer)",
  parameters: {
    docs: {
      description: {
        story:
          "`createReducer` is Solid's equivalent of React's `useReducer`. The dispatcher receives the current state and action arguments, returning the next state — keeping updates predictable and co-located.",
      },
    },
  },
  render: () => {
    type Action = "increment" | "decrement" | "double" | "reset";

    const dispatcher = (count: number, action: Action) => {
      if (action === "increment") return count + 1;
      if (action === "decrement") return count - 1;
      if (action === "double") return count * 2;
      return 0;
    };

    const [count, dispatch] = createReducer(dispatcher, 0);

    return (
      <Container>
        <h3 style={{ margin: 0 }}>createReducer</h3>

        <div
          style={{
            background: "#6366f1",
            color: "white",
            "border-radius": "12px",
            padding: "1.5rem",
            "text-align": "center",
            "font-size": "2.5rem",
            "font-weight": "700",
            "font-variant-numeric": "tabular-nums",
          }}
        >
          {count()}
        </div>

        <div style={{ display: "grid", "grid-template-columns": "1fr 1fr", gap: "0.5rem" }}>
          <Button onClick={() => dispatch("increment")}>+ Increment</Button>
          <Button onClick={() => dispatch("decrement")} variant="outline">− Decrement</Button>
          <Button onClick={() => dispatch("double")}>× Double</Button>
          <Button onClick={() => dispatch("reset")} variant="outline">↺ Reset</Button>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          <code>dispatch</code> passes an action to the reducer without exposing the raw setter —
          all valid transitions live in one place.
        </p>
      </Container>
    );
  },
});

export const MemoCache = meta.story({
  name: "Cached memo (createMemoCache)",
  parameters: {
    docs: {
      description: {
        story:
          "`createMemoCache` caches results by key — the calculation only runs the first time a key is seen, or when reactive signals inside the calculation change. Revisiting a cached key returns the stored result immediately.",
      },
    },
  },
  render: () => {
    const [key, setKey] = createSignal(10);
    const [log, setLog] = createSignal<string[]>([]);

    // Track which keys have been computed using a plain JS Set (not reactive).
    // Initialized with 10 since that's computed on first render.
    const computedKeys = new Set<number>([10]);

    const fib = createMemoCache(key, (n: number) => {
      let a = 0,
        b = 1;
      for (let i = 0; i < n; i++) [a, b] = [b, a + b];
      return a;
    });

    const selectKey = (n: number) => {
      const hit = computedKeys.has(n);
      if (!hit) computedKeys.add(n);
      setKey(n);
      setLog(h => [
        ...h.slice(-4),
        hit ? `↩ cache hit — fib(${n})` : `✦ computed — fib(${n})`,
      ]);
    };

    return (
      <Container>
        <h3 style={{ margin: 0 }}>createMemoCache — Fibonacci</h3>

        <Card>
          <StatRow label="key (n)" value={key()} />
          <StatRow label={`fib(${key()})`} value={fib()} />
        </Card>

        <ButtonRow>
          {[5, 10, 15, 20, 10, 5].map(n => (
            <Button onClick={() => selectKey(n)} variant="outline">fib({n})</Button>
          ))}
        </ButtonRow>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            "border-radius": "6px",
            padding: "0.5rem 0.75rem",
            "font-size": "0.8rem",
            "font-family": "monospace",
            "min-height": "3rem",
          }}
        >
          {log().length === 0 ? (
            <span style={{ color: "#94a3b8" }}>Click a button to start…</span>
          ) : (
            log().map(entry => (
              <div style={{ color: entry.startsWith("↩") ? "#10b981" : "#6366f1" }}>{entry}</div>
            ))
          )}
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Click fib(10) → fib(15) → fib(10): the third click is a{" "}
          <span style={{ color: "#10b981" }}>cache hit</span> — the calculation does not re-run.
        </p>
      </Container>
    );
  },
});
