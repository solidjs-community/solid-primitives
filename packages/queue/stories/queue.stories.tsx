import { createSignal } from "solid-js";
import { For, Show } from "@solidjs/web";
import preview from "../../../.storybook/preview.js";
import {
  createConcurrentTaskQueue,
  createPriorityQueue,
  createQueue,
  createTaskQueue,
} from "../src/index.js";
import readme from "../README.md?raw";
import {
  Badge,
  BoolRow,
  Button,
  ButtonRow,
  Container,
  EventLog,
  Section,
  Separator,
  StatRow,
  inputStyle,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Utilities/Queue",
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

export const FifoOrder = meta.story({
  name: "FIFO order",
  parameters: {
    docs: {
      description: {
        story:
          "`createQueue` maintains strict insertion order: items enter at the back and leave from the front. The blue badge marks the next item to be dequeued.",
      },
    },
  },
  render: () => {
    const [input, setInput] = createSignal("");
    const { queue, first, size, isEmpty, add, remove, clear } = createQueue<string>();

    const submit = () => {
      const val = input().trim();
      if (val) {
        add(val);
        setInput("");
      }
    };

    return (
      <Container width={300}>
        <StatRow label="size" value={size()} />
        <StatRow label="next" value={String(first() ?? "—")} />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={input()}
            onInput={e => setInput(e.currentTarget.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Item name…"
            style={{ ...inputStyle, flex: "1" }}
          />
          <Button onClick={submit} disabled={!input().trim()}>
            Add
          </Button>
        </div>
        <ButtonRow>
          <Button onClick={remove} disabled={isEmpty()} variant="secondary">
            Dequeue
          </Button>
          <Button onClick={clear} disabled={isEmpty()} variant="ghost">
            Clear all
          </Button>
        </ButtonRow>
        <Show when={queue().length > 0}>
          <div style={{ display: "flex", gap: "0.375rem", "flex-wrap": "wrap" }}>
            <For each={queue()}>
              {(item, i) => <Badge variant={i() === 0 ? "info" : "default"}>{item}</Badge>}
            </For>
          </div>
        </Show>
      </Container>
    );
  },
});

export const SortOnInsert = meta.story({
  name: "Sort-on-insert",
  parameters: {
    docs: {
      description: {
        story:
          "`createPriorityQueue` re-sorts the internal array on every `add`. The comparator `(a, b) => a - b` keeps the smallest value at the front — the green badge is always the next to dequeue.",
      },
    },
  },
  render: () => {
    const NUMS = [5, 2, 8, 1, 9, 3, 7, 4];
    const { queue, first, isEmpty, add, remove } = createPriorityQueue<number>((a, b) => a - b);

    return (
      <Container width={300}>
        <StatRow label="next (min)" value={String(first() ?? "—")} />
        <Section title="Add number">
          <ButtonRow>
            <For each={NUMS}>
              {n => (
                <Button
                  variant="outline"
                  onClick={() => add(n)}
                  style={{ "min-width": "2.5rem" }}
                >
                  {n}
                </Button>
              )}
            </For>
          </ButtonRow>
        </Section>
        <Button onClick={remove} disabled={isEmpty()} variant="secondary">
          Remove min
        </Button>
        <Show when={queue().length > 0}>
          <div style={{ display: "flex", gap: "0.375rem", "flex-wrap": "wrap" }}>
            <For each={queue()}>
              {(n, i) => <Badge variant={i() === 0 ? "success" : "default"}>{n}</Badge>}
            </For>
          </div>
        </Show>
      </Container>
    );
  },
});

export const SerialExecution = meta.story({
  name: "One-at-a-time tasks",
  parameters: {
    docs: {
      description: {
        story:
          "`createTaskQueue` drains tasks sequentially — the next task starts only after the current one settles. Enqueue several tasks rapidly and watch them execute one by one.",
      },
    },
  },
  render: () => {
    const { enqueue, size, active } = createTaskQueue<string>();
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);

    const addTask = (label: string, ms: number) => {
      enqueue(async () => {
        await new Promise<void>(r => setTimeout(r, ms));
        return label;
      }).then(result => {
        setLog(prev =>
          [{ label: result, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5),
        );
      });
    };

    const TASKS = [
      { label: "fast · 200ms", ms: 200 },
      { label: "medium · 600ms", ms: 600 },
      { label: "slow · 1.2s", ms: 1200 },
    ];

    return (
      <Container width={340}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <StatRow label="waiting" value={size()} />
          </div>
          <div style={{ flex: 1 }}>
            <BoolRow label="active" value={active()} />
          </div>
        </div>
        <Separator />
        <Section title="Enqueue task">
          <ButtonRow>
            <For each={TASKS}>
              {t => (
                <Button variant="outline" onClick={() => addTask(t.label, t.ms)}>
                  {t.label}
                </Button>
              )}
            </For>
          </ButtonRow>
        </Section>
        <EventLog entries={log()} />
      </Container>
    );
  },
});

export const ConcurrentSlots = meta.story({
  name: "Concurrent slots",
  parameters: {
    docs: {
      description: {
        story:
          "`createConcurrentTaskQueue(3)` runs at most 3 tasks at once. Tasks beyond that limit queue and start as slots open. `active` is a count, not a boolean.",
      },
    },
  },
  render: () => {
    const CONCURRENCY = 3;
    const { enqueue, size, active } = createConcurrentTaskQueue<string>(CONCURRENCY);
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);
    let counter = 0;

    const addBatch = (count: number) => {
      for (let i = 0; i < count; i++) {
        const id = ++counter;
        const ms = 600 + (id * 300) % 900;
        enqueue(async () => {
          await new Promise<void>(r => setTimeout(r, ms));
          return `task-${id}`;
        }).then(result => {
          setLog(prev =>
            [{ label: result, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 6),
          );
        });
      }
    };

    return (
      <Container width={340}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <StatRow label={`active (max ${CONCURRENCY})`} value={active()} />
          </div>
          <div style={{ flex: 1 }}>
            <StatRow label="waiting" value={size()} />
          </div>
        </div>
        <Separator />
        <ButtonRow>
          <Button onClick={() => addBatch(3)}>Add 3 tasks</Button>
          <Button onClick={() => addBatch(6)} variant="secondary">
            Add 6 tasks
          </Button>
        </ButtonRow>
        <EventLog entries={log()} />
      </Container>
    );
  },
});
