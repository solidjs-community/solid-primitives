import { For } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  ReactiveSet,
  ReactiveWeakSet,
  union,
  intersection,
  difference,
  symmetricDifference,
} from "@solid-primitives/set";
import readme from "../README.md?raw";
import {
  Button,
  Badge,
  Container,
  StatRow,
  BoolRow,
  Section,
  ButtonRow,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/Set",
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

// ─── Story 1: Key-level reactivity ──────────────────────────────────────────

const FRUITS = ["apple", "banana", "cherry", "dragonfruit", "elderberry", "fig"];

export const KeyLevelReactivity = meta.story({
  name: "Key-level reactivity",
  parameters: {
    docs: {
      description: {
        story:
          "Each `has()` call subscribes to exactly one key. Toggle **banana** — only its row updates. The other `has()` checks do not re-evaluate because their subscriptions are independent.",
      },
    },
  },
  render: () => {
    const set = new ReactiveSet(["apple", "cherry", "fig"]);

    return (
      <Container>
        <Section title="Members">
          <div style={{ display: "flex", "flex-wrap": "wrap", gap: "0.4rem" }}>
            <For each={[...set]}>{item => <Badge>{item}</Badge>}</For>
          </div>
          <StatRow label="size" value={set.size} />
        </Section>

        <Section title="Toggle">
          <ButtonRow>
            <For each={FRUITS}>
              {fruit => (
                <Button
                  variant={set.has(fruit) ? "primary" : "outline"}
                  onClick={() => (set.has(fruit) ? set.delete(fruit) : set.add(fruit))}
                  style={{ padding: "0.3rem 0.65rem", "font-size": "0.82rem" }}
                >
                  {fruit}
                </Button>
              )}
            </For>
          </ButtonRow>
        </Section>

        <Section title='has() per key'>
          <For each={FRUITS}>
            {fruit => <BoolRow label={`has("${fruit}")`} value={set.has(fruit)} />}
          </For>
        </Section>
      </Container>
    );
  },
});

// ─── Story 2: Set algebra ────────────────────────────────────────────────────

const NUMS = [1, 2, 3, 4, 5, 6, 7, 8];
const numBtnStyle = {
  padding: "0.25rem 0.5rem",
  "font-size": "0.82rem",
  "min-width": "1.8rem",
} as const;

export const SetAlgebra = meta.story({
  name: "Set algebra",
  parameters: {
    docs: {
      description: {
        story:
          "Each operation wraps a `createMemo` internally and re-derives whenever either input changes. Toggle members of **A** or **B** to see all four derived sets update live.",
      },
    },
  },
  render: () => {
    const a = new ReactiveSet([1, 2, 3, 4, 5]);
    const b = new ReactiveSet([3, 4, 5, 6, 7]);
    const u = union(a, b);
    const inter = intersection(a, b);
    const diff = difference(a, b);
    const symDiff = symmetricDifference(a, b);

    const toggle = (set: ReactiveSet<number>, n: number) =>
      set.has(n) ? set.delete(n) : set.add(n);

    const chipRow = (
      accessor: () => ReadonlySet<number>,
      variant: "info" | "success" | "warning" | "error",
    ) => (
      <div style={{ display: "flex", gap: "0.25rem", "flex-wrap": "wrap", "min-height": "1.4rem", "align-items": "center" }}>
        <For each={[...accessor()]}>{n => <Badge variant={variant}>{n}</Badge>}</For>
      </div>
    );

    const opRow = (
      label: string,
      accessor: () => ReadonlySet<number>,
      variant: "info" | "success" | "warning" | "error",
    ) => (
      <div style={{ display: "flex", gap: "0.75rem", "align-items": "center" }}>
        <code style={{ "font-size": "0.78rem", color: "#64748b", "min-width": "200px", "flex-shrink": "0" }}>
          {label}
        </code>
        {chipRow(accessor, variant)}
      </div>
    );

    return (
      <Container width={480}>
        <Section title="Inputs">
          <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
            <span style={{ "font-size": "0.8rem", "font-weight": "600", width: "12px", color: "#64748b" }}>A</span>
            <ButtonRow>
              <For each={NUMS}>
                {n => (
                  <Button
                    variant={a.has(n) ? "primary" : "outline"}
                    onClick={() => toggle(a, n)}
                    style={numBtnStyle}
                  >
                    {n}
                  </Button>
                )}
              </For>
            </ButtonRow>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
            <span style={{ "font-size": "0.8rem", "font-weight": "600", width: "12px", color: "#64748b" }}>B</span>
            <ButtonRow>
              <For each={NUMS}>
                {n => (
                  <Button
                    variant={b.has(n) ? "primary" : "outline"}
                    onClick={() => toggle(b, n)}
                    style={numBtnStyle}
                  >
                    {n}
                  </Button>
                )}
              </For>
            </ButtonRow>
          </div>
        </Section>

        <Section title="Derived">
          {opRow("union(A, B)", u, "info")}
          {opRow("intersection(A, B)", inter, "success")}
          {opRow("difference(A, B)", diff, "warning")}
          {opRow("symmetricDifference(A, B)", symDiff, "error")}
        </Section>
      </Container>
    );
  },
});

// ─── Story 3: WeakSet object membership ─────────────────────────────────────

type User = { name: string };
const ALICE: User = { name: "Alice" };
const BOB: User = { name: "Bob" };
const CAROL: User = { name: "Carol" };
const DANA: User = { name: "Dana" };
const MEMBERS: User[] = [ALICE, BOB, CAROL, DANA];

export const WeakSetMembership = meta.story({
  name: "WeakSet object membership",
  parameters: {
    docs: {
      description: {
        story:
          "`ReactiveWeakSet` makes `has()` reactive for object references without exposing size or iteration. Each membership check is independent — toggling one object leaves the others unaffected.",
      },
    },
  },
  render: () => {
    const ws = new ReactiveWeakSet<User>([ALICE, BOB]);

    return (
      <Container>
        <Section title="Objects">
          <For each={MEMBERS}>
            {user => (
              <div
                style={{
                  display: "flex",
                  "align-items": "center",
                  gap: "0.75rem",
                  padding: "0.25rem 0",
                }}
              >
                <span style={{ flex: "1", "font-size": "0.9rem", "font-weight": "500" }}>
                  {user.name}
                </span>
                <Badge variant={ws.has(user) ? "success" : "default"}>
                  {ws.has(user) ? "in set" : "absent"}
                </Badge>
                <Button
                  variant={ws.has(user) ? "outline" : "primary"}
                  onClick={() => (ws.has(user) ? ws.delete(user) : ws.add(user))}
                  style={{ padding: "0.25rem 0.75rem", "font-size": "0.82rem" }}
                >
                  {ws.has(user) ? "remove" : "add"}
                </Button>
              </div>
            )}
          </For>
        </Section>
      </Container>
    );
  },
});
