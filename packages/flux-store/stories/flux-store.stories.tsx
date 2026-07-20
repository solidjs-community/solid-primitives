import { createSignal } from "solid-js";
import { For } from "@solidjs/web";
import preview from "../../../.storybook/preview.js";
import {
  createAction,
  createActions,
  createFluxStore,
  createFluxStoreFactory,
} from "../src/index.js";
import readme from "../README.md?raw";
import {
  BoolRow,
  Button,
  ButtonRow,
  Card,
  Container,
  ProgressBar,
  Section,
  Separator,
  StatRow,
  ValueDisplay,
  colors,
  font,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Utilities/Flux Store",
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

export const BudgetTracker = meta.story({
  name: "Getters derive from reactive state",
  parameters: {
    docs: {
      description: {
        story:
          "`createFluxStore` separates reads from writes: `getters` expose reactive accessor functions that derive values from the store state, and `actions` are the only path to mutation. `remaining`, `percentUsed`, and `isOverBudget` all re-evaluate automatically whenever `spent` changes.",
      },
    },
  },
  render: () => {
    const { state, getters, actions } = createFluxStore(
      { total: 200, spent: 0 },
      {
        getters: s => ({
          remaining: () => s.total - s.spent,
          percentUsed: () => Math.min(100, (s.spent / s.total) * 100),
          isOverBudget: () => s.spent > s.total,
        }),
        actions: setState => ({
          add: (n: number) =>
            setState(s => {
              s.spent = Math.min(400, s.spent + n);
            }),
          reset: () =>
            setState(s => {
              s.spent = 0;
            }),
        }),
      },
    );

    return (
      <Container width={300}>
        <StatRow label="budget" value={`$${state.total}`} />
        <StatRow label="spent" value={`$${state.spent}`} />
        <StatRow label="remaining" value={`$${getters.remaining()}`} />
        <ProgressBar
          value={getters.percentUsed()}
          color={getters.isOverBudget() ? "#dc2626" : undefined}
          label={`${Math.round(getters.percentUsed())}% used`}
        />
        <BoolRow label="isOverBudget" value={getters.isOverBudget()} />
        <Separator />
        <Section title="Spend">
          <ButtonRow>
            {([25, 50, 100] as const).map(n => (
              <Button onClick={() => actions.add(n)} style={{ flex: "1" }}>
                +${n}
              </Button>
            ))}
          </ButtonRow>
        </Section>
        <Button variant="ghost" onClick={actions.reset}>
          Reset
        </Button>
      </Container>
    );
  },
});

export const IsolatedInstances = meta.story({
  name: "Isolated instances from one factory",
  parameters: {
    docs: {
      description: {
        story:
          "`createFluxStoreFactory` encapsulates a store schema into a reusable factory function. Each call produces an independent instance with its own reactive state — mutating one instance never affects the other.",
      },
    },
  },
  render: () => {
    const createPlayerStore = createFluxStoreFactory(
      { name: "", score: 0 },
      {
        getters: s => ({
          score: () => s.score,
        }),
        actions: setState => ({
          point: () =>
            setState(s => {
              s.score += 1;
            }),
          reset: () =>
            setState(s => {
              s.score = 0;
            }),
        }),
      },
    );

    const alpha = createPlayerStore({ name: "Alpha", score: 0 });
    const beta = createPlayerStore({ name: "Beta", score: 0 });

    const leader = () => {
      const a = alpha.getters.score();
      const b = beta.getters.score();
      if (a === b) return null;
      return a > b ? "Alpha" : "Beta";
    };

    return (
      <Container width={360}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Card>
            <span
              style={{
                "font-size": font.sizeSm,
                "font-weight": "600",
                color: colors.muted,
                "text-transform": "uppercase",
                "letter-spacing": "0.06em",
              }}
            >
              {alpha.state.name}
            </span>
            <span
              style={{
                "font-size": "2rem",
                "font-weight": "700",
                "font-variant-numeric": "tabular-nums",
                color: leader() === "Alpha" ? colors.success : "#1e293b",
              }}
            >
              {alpha.getters.score()}
            </span>
            <ButtonRow>
              <Button onClick={alpha.actions.point} style={{ flex: "1" }}>
                +1
              </Button>
              <Button variant="ghost" onClick={alpha.actions.reset}>
                Reset
              </Button>
            </ButtonRow>
          </Card>

          <Card>
            <span
              style={{
                "font-size": font.sizeSm,
                "font-weight": "600",
                color: colors.muted,
                "text-transform": "uppercase",
                "letter-spacing": "0.06em",
              }}
            >
              {beta.state.name}
            </span>
            <span
              style={{
                "font-size": "2rem",
                "font-weight": "700",
                "font-variant-numeric": "tabular-nums",
                color: leader() === "Beta" ? colors.success : "#1e293b",
              }}
            >
              {beta.getters.score()}
            </span>
            <ButtonRow>
              <Button onClick={beta.actions.point} style={{ flex: "1" }}>
                +1
              </Button>
              <Button variant="ghost" onClick={beta.actions.reset}>
                Reset
              </Button>
            </ButtonRow>
          </Card>
        </div>

        <div
          style={{
            "text-align": "center",
            "font-size": font.sizeSm,
            color: leader() ? colors.success : colors.muted,
          }}
        >
          {leader() ? `${leader()} leads` : "Tied"}
        </div>
      </Container>
    );
  },
});

export const UntrackWrappers = meta.story({
  name: "Wrapping setters as untracked actions",
  parameters: {
    docs: {
      description: {
        story:
          "`createActions` wraps each function in a record with `createAction`, making them run inside `untrack`. This keeps calls safe from any reactive context — reads inside the action won't register dependencies and writes won't throw in owned scopes. The wrapped API is drop-in compatible with the original.",
      },
    },
  },
  render: () => {
    const [theme, setTheme] = createSignal<"light" | "dark" | "system">("system");
    const [density, setDensity] = createSignal<"compact" | "comfortable" | "spacious">(
      "comfortable",
    );
    const [animations, setAnimations] = createSignal(true);

    const actions = createActions({
      setTheme,
      setDensity,
      toggleAnimations: () => setAnimations(v => !v),
    });

    return (
      <Container width={320}>
        <Section title="Theme">
          <ButtonRow>
            {(["light", "dark", "system"] as const).map(t => (
              <Button
                variant={theme() === t ? "primary" : "outline"}
                onClick={() => actions.setTheme(t)}
                style={{ flex: "1" }}
              >
                {t}
              </Button>
            ))}
          </ButtonRow>
        </Section>

        <Section title="Density">
          <ButtonRow>
            {(["compact", "comfortable", "spacious"] as const).map(d => (
              <Button
                variant={density() === d ? "primary" : "outline"}
                onClick={() => actions.setDensity(d)}
                style={{ flex: "1", "font-size": "0.78rem" }}
              >
                {d}
              </Button>
            ))}
          </ButtonRow>
        </Section>

        <BoolRow label="animations" value={animations()} />
        <Button
          variant="secondary"
          onClick={actions.toggleAnimations}
          style={{ "align-self": "flex-start" }}
        >
          {animations() ? "Disable" : "Enable"} animations
        </Button>

        <Separator />
        <ValueDisplay label="theme" value={theme()} />
        <ValueDisplay label="density" value={density()} />
      </Container>
    );
  },
});

export const SingleActionWrapper = meta.story({
  name: "Single function wrapped as action",
  parameters: {
    docs: {
      description: {
        story:
          "`createAction` wraps a single function so its body runs inside `untrack`. A common use case: an imperative handler that reads reactive state to compute a next value without accidentally registering those reads as reactive dependencies.",
      },
    },
  },
  render: () => {
    const [count, setCount] = createSignal(0);
    const [log, setLog] = createSignal<string[]>([]);

    const nudge = createAction((direction: "up" | "down") => {
      const next = count() + (direction === "up" ? 1 : -1);
      setCount(next);
      setLog(l => [`${direction === "up" ? "↑" : "↓"} ${next}`, ...l].slice(0, 5));
    });

    return (
      <Container width={280}>
        <div
          style={{
            "text-align": "center",
            "font-size": "2.5rem",
            "font-weight": "700",
            "font-variant-numeric": "tabular-nums",
            color: count() === 0 ? colors.muted : count() > 0 ? colors.success : "#dc2626",
            padding: "0.5rem 0",
          }}
        >
          {count()}
        </div>
        <ButtonRow>
          <Button onClick={() => nudge("up")} style={{ flex: "1" }}>
            ↑ Up
          </Button>
          <Button onClick={() => nudge("down")} variant="secondary" style={{ flex: "1" }}>
            ↓ Down
          </Button>
        </ButtonRow>
        <Separator />
        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            gap: "0.2rem",
            "min-height": "80px",
          }}
        >
          <For each={log()}>
            {(entry, i) => (
              <span
                style={{
                  "font-family": font.mono,
                  "font-size": font.sizeSm,
                  color: i() === 0 ? "#1e293b" : colors.muted,
                }}
              >
                {entry}
              </span>
            )}
          </For>
          {log().length === 0 && (
            <span style={{ "font-size": font.sizeSm, color: colors.muted }}>no actions yet</span>
          )}
        </div>
      </Container>
    );
  },
});
