import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { List, listArray } from "@solid-primitives/list";
import readme from "../README.md?raw";
import {
  Button,
  ButtonRow,
  Container,
  Separator,
  TextField,
  colors,
  font,
  radii,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Control Flow/List",
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

// ── Story 1: Index tracks position ────────────────────────────────────────────

export const IndexOnReorder = meta.story({
  name: "Index tracks position",
  parameters: {
    docs: {
      description: {
        story:
          "Shuffling or rolling the array updates each item's `index()` reactively without recreating elements. The per-item background is assigned once at element creation and stays with the item across reorders — confirming no element rebuild.",
      },
    },
  },
  render: () => {
    const NAMES = ["Alice", "Bob", "Carol", "Dave", "Eve"];
    const PALETTE = ["#e0e7ff", "#fce7f3", "#d1fae5", "#fef3c7", "#fee2e2"];
    const [items, setItems] = createSignal([...NAMES]);
    let colorSeq = 0;

    const shuffle = () =>
      setItems(arr => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
          const j = ~~(Math.random() * (i + 1));
          const tmp = a[i]!;
          a[i] = a[j]!;
          a[j] = tmp;
        }
        return a;
      });

    const roll = () =>
      setItems(arr => {
        const a = [...arr];
        a.unshift(a.pop()!);
        return a;
      });

    return (
      <Container width={280}>
        <ButtonRow>
          <Button onClick={shuffle} style={{ flex: 1 }}>
            Shuffle
          </Button>
          <Button onClick={roll} variant="outline" style={{ flex: 1 }}>
            Roll
          </Button>
        </ButtonRow>
        <Separator />
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
          <List each={items()} recycle>
            {(item, index) => {
              const color = PALETTE[colorSeq++ % PALETTE.length]!;
              return (
                <div
                  style={{
                    display: "flex",
                    "align-items": "center",
                    gap: "0.5rem",
                    padding: "0.3rem 0.7rem",
                    background: color,
                    "border-radius": radii.md,
                    "font-size": font.sizeSm,
                    "font-family": font.mono,
                  }}
                >
                  <span
                    style={{ color: colors.muted, "min-width": "0.9rem", "text-align": "right" }}
                  >
                    {index()}
                  </span>
                  <span>{item()}</span>
                </div>
              );
            }}
          </List>
        </div>
      </Container>
    );
  },
});

// ── Story 2: Value updates in place ───────────────────────────────────────────

export const ValueInPlace = meta.story({
  name: "Value updates in place",
  parameters: {
    docs: {
      description: {
        story:
          "Replacing a value at an existing position updates `item()` on the same element without destroying it. The stable background color (set once at element creation) confirms the DOM node survives the value swap.",
      },
    },
  },
  render: () => {
    const PALETTE = ["#e0e7ff", "#fce7f3", "#d1fae5"];
    const [items, setItems] = createSignal(["apples", "bananas", "cherries"]);
    const [editing, setEditing] = createSignal<number | null>(null);
    const [draft, setDraft] = createSignal("");
    let colorSeq = 0;

    const startEdit = (i: number, val: string) => {
      setEditing(i);
      setDraft(val);
    };

    const commit = () => {
      const i = editing();
      if (i === null) return;
      setItems(arr => {
        const a = [...arr];
        a[i] = draft();
        return a;
      });
      setEditing(null);
    };

    return (
      <Container width={280}>
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
          <List each={items()} recycle>
            {(item, index) => {
              const color = PALETTE[colorSeq++ % PALETTE.length]!;
              return (
                <div
                  style={{
                    display: "flex",
                    "align-items": "center",
                    gap: "0.4rem",
                    padding: "0.3rem 0.6rem",
                    background: color,
                    "border-radius": radii.md,
                    "font-size": font.sizeSm,
                  }}
                >
                  <span style={{ color: colors.muted, "min-width": "0.9rem" }}>{index()}</span>
                  <span style={{ flex: 1, "font-family": font.mono }}>{item()}</span>
                  <Button
                    variant="ghost"
                    onClick={() => startEdit(index(), item())}
                    style={{ padding: "0.1rem 0.3rem", "font-size": font.sizeSm }}
                  >
                    edit
                  </Button>
                </div>
              );
            }}
          </List>
        </div>
        <Show when={editing() !== null}>
          <Separator />
          <TextField label={`Item ${editing()}`} value={draft()} onChange={setDraft} />
          <ButtonRow>
            <Button onClick={commit} style={{ flex: 1 }}>
              Save
            </Button>
            <Button onClick={() => setEditing(null)} variant="outline" style={{ flex: 1 }}>
              Cancel
            </Button>
          </ButtonRow>
        </Show>
      </Container>
    );
  },
});

// ── Story 3: Fallback when empty ──────────────────────────────────────────────

export const FallbackOnEmpty = meta.story({
  name: "Fallback when empty",
  parameters: {
    docs: {
      description: {
        story:
          "The `fallback` prop renders when `each` is empty or falsy — identical to the same prop on `<For>` and `<Index>`.",
      },
    },
  },
  render: () => {
    const [items, setItems] = createSignal(["Task A", "Task B", "Task C"]);
    let nextChar = 68; // 'D'

    return (
      <Container width={260}>
        <ButtonRow>
          <Button
            onClick={() => setItems(arr => [...arr, `Task ${String.fromCharCode(nextChar++)}`])}
            style={{ flex: 1 }}
          >
            Add
          </Button>
          <Button
            onClick={() => setItems(arr => arr.slice(0, -1))}
            variant="outline"
            style={{ flex: 1 }}
            disabled={items().length === 0}
          >
            Remove last
          </Button>
        </ButtonRow>
        <Separator />
        <List
          each={items()}
          recycle
          fallback={
            <div
              style={{
                color: colors.muted,
                "font-size": font.sizeSm,
                "text-align": "center",
                padding: "0.75rem 0",
              }}
            >
              Empty — add an item above
            </div>
          }
        >
          {(item, index) => (
            <div
              style={{
                padding: "0.3rem 0.5rem",
                "font-size": font.sizeSm,
                "font-family": font.mono,
                "border-bottom": `1px solid ${colors.border}`,
              }}
            >
              <span style={{ color: colors.muted }}>{index()}&nbsp;</span>
              {item()}
            </div>
          )}
        </List>
      </Container>
    );
  },
});

// ── Story 4: listArray programmatic mapper ────────────────────────────────────

export const ListArrayMapper = meta.story({
  name: "listArray — programmatic mapper",
  parameters: {
    docs: {
      description: {
        story:
          "`listArray` powers `<List>` but can be used directly outside JSX — in stores, hooks, or anywhere a reactive array transformation is needed. The stable `[id:N]` prefix is set once per element; after a shuffle it stays with the item while only the position in the label updates.",
      },
    },
  },
  render: () => {
    const [items, setItems] = createSignal(["alpha", "beta", "gamma"]);
    let seq = 0;
    let counter = 3;

    const rows = listArray(
      items,
      (item, index) => {
        const id = ++seq;
        return () => `[id:${id}]  ${index() + 1}. ${item()}`;
      },
      { recycle: true },
    );

    const shuffle = () =>
      setItems(arr => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
          const j = ~~(Math.random() * (i + 1));
          const tmp = a[i]!;
          a[i] = a[j]!;
          a[j] = tmp;
        }
        return a;
      });

    return (
      <Container width={280}>
        <ButtonRow>
          <Button
            onClick={() => setItems(arr => [...arr, `item-${++counter}`])}
            style={{ flex: 1 }}
          >
            Add item
          </Button>
          <Button onClick={shuffle} variant="outline" style={{ flex: 1 }}>
            Shuffle
          </Button>
        </ButtonRow>
        <Separator />
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
          <For each={rows()}>
            {row => (
              <div
                style={{
                  "font-family": font.mono,
                  "font-size": font.sizeSm,
                  color: colors.dark,
                  padding: "0.25rem 0.5rem",
                  background: colors.surface,
                  "border-radius": radii.sm,
                  "border-left": `3px solid ${colors.border}`,
                }}
              >
                {row()}
              </div>
            )}
          </For>
        </div>
      </Container>
    );
  },
});
