import { createSignal } from "solid-js";
import { For, Show } from "@solidjs/web";
import { createStore } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createUndoHistory } from "../src/index.js";
import readme from "../README.md?raw";
import {
  BoolRow,
  Button,
  ButtonRow,
  Container,
  Section,
  Separator,
  Stat,
  StatRow,
  TextField,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Utilities/History",
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

export const SignalTracking = meta.story({
  name: "Signal undo/redo",
  parameters: {
    docs: {
      description: {
        story:
          "The source callback reads the signal and returns a setter closure. Each distinct value creates a history entry. `canUndo` and `canRedo` reflect availability.",
      },
    },
  },
  render: () => {
    const [count, setCount] = createSignal(0);

    const history = createUndoHistory(() => {
      const v = count();
      return () => setCount(v);
    });

    return (
      <Container width={280}>
        <Stat label="count">{count()}</Stat>
        <Section title="Controls">
          <ButtonRow>
            <Button onClick={() => setCount(n => n - 1)}>−</Button>
            <Button onClick={() => setCount(n => n + 1)}>+</Button>
          </ButtonRow>
        </Section>
        <Section title="History">
          <BoolRow label="canUndo" value={history.canUndo()} />
          <BoolRow label="canRedo" value={history.canRedo()} />
          <ButtonRow>
            <Button onClick={history.undo} disabled={!history.canUndo()} variant="secondary">
              Undo
            </Button>
            <Button onClick={history.redo} disabled={!history.canRedo()} variant="secondary">
              Redo
            </Button>
          </ButtonRow>
        </Section>
      </Container>
    );
  },
});

export const StoreRollback = meta.story({
  name: "Store snapshot rollback",
  parameters: {
    docs: {
      description: {
        story:
          "The source reads the entire store and captures a JSON snapshot each time any field changes. Undo/redo reconciles the store back to the saved snapshot.",
      },
    },
  },
  render: () => {
    const ROLES = ["viewer", "editor", "admin"] as const;
    const [form, setForm] = createStore({ name: "", role: "viewer" as (typeof ROLES)[number] });

    const history = createUndoHistory(() => {
      const copy = JSON.parse(JSON.stringify(form)) as typeof form;
      return () => setForm(s => { Object.assign(s, copy); });
    });

    return (
      <Container width={300}>
        <TextField
          label="Name"
          value={form.name}
          onChange={v => setForm(s => { s.name = v; })}
          placeholder="e.g. Alice"
        />
        <Section title="Role">
          <ButtonRow>
            <For each={ROLES}>
              {role => (
                <Button
                  variant={form.role === role ? "primary" : "outline"}
                  onClick={() => setForm(s => { s.role = role; })}
                >
                  {role}
                </Button>
              )}
            </For>
          </ButtonRow>
        </Section>
        <Separator />
        <StatRow label="name" value={form.name || "—"} />
        <StatRow label="role" value={form.role} />
        <Section title="History">
          <BoolRow label="canUndo" value={history.canUndo()} />
          <BoolRow label="canRedo" value={history.canRedo()} />
          <ButtonRow>
            <Button onClick={history.undo} disabled={!history.canUndo()} variant="secondary">
              Undo
            </Button>
            <Button onClick={history.redo} disabled={!history.canRedo()} variant="secondary">
              Redo
            </Button>
          </ButtonRow>
        </Section>
      </Container>
    );
  },
});

export const PausedBatching = meta.story({
  name: "Pause to batch changes",
  parameters: {
    docs: {
      description: {
        story:
          "Returning a falsy value from the source skips recording a history entry. When tracking resumes, the source re-runs and captures all accumulated changes as a single step.",
      },
    },
  },
  render: () => {
    const [count, setCount] = createSignal(0);
    const [paused, setPaused] = createSignal(false);

    const history = createUndoHistory(() => {
      if (paused()) return;
      const v = count();
      return () => setCount(v);
    });

    return (
      <Container width={280}>
        <Stat label="count">{count()}</Stat>
        <Section title="Controls">
          <ButtonRow>
            <Button onClick={() => setCount(n => n - 1)}>−</Button>
            <Button onClick={() => setCount(n => n + 1)}>+</Button>
          </ButtonRow>
          <ButtonRow>
            <Button onClick={() => setPaused(p => !p)} variant={paused() ? "primary" : "outline"}>
              <Show when={paused()} fallback="Pause tracking">
                Resume tracking
              </Show>
            </Button>
          </ButtonRow>
        </Section>
        <Section title="History">
          <BoolRow label="paused" value={paused()} />
          <BoolRow label="canUndo" value={history.canUndo()} />
          <BoolRow label="canRedo" value={history.canRedo()} />
          <ButtonRow>
            <Button onClick={history.undo} disabled={!history.canUndo()} variant="secondary">
              Undo
            </Button>
            <Button onClick={history.redo} disabled={!history.canRedo()} variant="secondary">
              Redo
            </Button>
          </ButtonRow>
        </Section>
      </Container>
    );
  },
});
