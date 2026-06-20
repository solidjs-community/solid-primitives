import { createEffect, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { captureStoreUpdates, trackDeep, trackStore } from "@solid-primitives/deep";
import readme from "../README.md?raw";
import {
  Button,
  Container,
  Section,
  Separator,
  StatRow,
  TextField,
  colors,
  font,
  radii,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/Deep",
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

// ─── trackDeep ───────────────────────────────────────────────────────────────

export const TrackDeepMultiple = meta.story({
  name: "One effect, two stores",
  parameters: {
    docs: {
      description: {
        story:
          "`trackDeep` accepts any wrappable structure — not just a store proxy but any plain object or array containing store nodes. Here two independent stores (`user` and `prefs`) are bundled into a single plain object and subscribed with one `createEffect`. Any mutation to either store fires the effect. `trackStore` cannot do this — it requires a store proxy at the root.",
      },
    },
  },
  render: () => {
    const [user, setUser] = createStore({ name: "Alice", email: "alice@example.com" });
    const [prefs, setPrefs] = createStore({ theme: "light" as "light" | "dark", notify: true });

    const [saveCount, setSaveCount] = createSignal(0);
    const [lastSave, setLastSave] = createSignal("—");

    let ready = false;
    createEffect(
      () => trackDeep({ user, prefs }),
      () => {
        if (!ready) {
          ready = true;
          return;
        }
        setSaveCount(c => c + 1);
        setLastSave(new Date().toLocaleTimeString());
      },
    );

    return (
      <Container width={300}>
        <Section title="User">
          <TextField
            label="Name"
            value={user.name}
            onChange={v =>
              setUser(s => {
                s.name = v;
              })
            }
          />
          <TextField
            label="Email"
            value={user.email}
            onChange={v =>
              setUser(s => {
                s.email = v;
              })
            }
          />
        </Section>
        <Section title="Preferences">
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              variant={prefs.theme === "dark" ? "primary" : "outline"}
              onClick={() =>
                setPrefs(s => {
                  s.theme = s.theme === "light" ? "dark" : "light";
                })
              }
              style={{ flex: "1" }}
            >
              {prefs.theme === "dark" ? "Dark" : "Light"} theme
            </Button>
            <Button
              variant={prefs.notify ? "primary" : "outline"}
              onClick={() =>
                setPrefs(s => {
                  s.notify = !s.notify;
                })
              }
              style={{ flex: "1" }}
            >
              Notify {prefs.notify ? "on" : "off"}
            </Button>
          </div>
        </Section>
        <Separator />
        <Section title="Effect (one for both stores)">
          <StatRow label="Auto-saves" value={saveCount()} />
          <StatRow label="Last at" value={lastSave()} />
        </Section>
      </Container>
    );
  },
});

// ─── trackStore ──────────────────────────────────────────────────────────────

export const TrackStoreWholeTree = meta.story({
  name: "Sync on any nested change",
  parameters: {
    docs: {
      description: {
        story:
          "`trackStore` subscribes to every node in a store tree using Solid's internal `$TRACK` structural subscriptions, and memoizes a per-node accessor in a `WeakMap` so each node is only ever subscribed once regardless of how many effects share the same store. Edit the note, adjust a quantity, or add and remove items — any change at any depth fires the effect once.",
      },
    },
  },
  render: () => {
    const [cart, setCart] = createStore({
      items: [
        { name: "Widget", qty: 1 },
        { name: "Gadget", qty: 2 },
      ] as { name: string; qty: number }[],
      note: "",
    });

    const [fireCount, setFireCount] = createSignal(0);
    let nextId = 2;

    let ready = false;
    createEffect(
      () => trackStore(cart),
      () => {
        if (!ready) {
          ready = true;
          return;
        }
        setFireCount(c => c + 1);
      },
    );

    return (
      <Container width={300}>
        <Section title="Cart">
          <For each={cart.items}>
            {(item, i) => (
              <div style={{ display: "flex", gap: "0.4rem", "align-items": "center" }}>
                <span style={{ flex: 1, "font-size": font.sizeBase }}>{item.name}</span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCart(s => {
                      if (s.items[i()].qty > 1) s.items[i()].qty--;
                    })
                  }
                >
                  −
                </Button>
                <span
                  style={{
                    "font-variant-numeric": "tabular-nums",
                    "min-width": "1.5rem",
                    "text-align": "center",
                    "font-size": font.sizeBase,
                  }}
                >
                  {item.qty}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCart(s => {
                      s.items[i()].qty++;
                    })
                  }
                >
                  +
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setCart(s => {
                      s.items.splice(i(), 1);
                    })
                  }
                >
                  ×
                </Button>
              </div>
            )}
          </For>
        </Section>
        <TextField
          label="Order note"
          value={cart.note}
          onChange={v =>
            setCart(s => {
              s.note = v;
            })
          }
          placeholder="Special instructions…"
        />
        <Button
          variant="secondary"
          onClick={() => {
            nextId++;
            setCart(s => {
              s.items.push({ name: `Item ${nextId}`, qty: 1 });
            });
          }}
        >
          Add item
        </Button>
        <Separator />
        <Section title="Observer (trackStore)">
          <StatRow label="Effect fires" value={fireCount()} />
        </Section>
      </Container>
    );
  },
});

// ─── captureStoreUpdates ─────────────────────────────────────────────────────

export const StoreDeltaStory = meta.story({
  name: "Which path changed?",
  parameters: {
    docs: {
      description: {
        story:
          "`captureStoreUpdates(store)` returns a `getDelta()` function that, on each call, reports the `{ path, value }` pairs describing exactly which store nodes changed since the previous call. Wrap it in `createEffect` for a reactive delta stream — ideal for undo/redo stacks, selective sync, or change debugging. Toggle a task or rename one to see the path and the affected node.",
      },
    },
  },
  render: () => {
    const [board, setBoard] = createStore({
      tasks: [
        { id: 1, title: "Design", done: false },
        { id: 2, title: "Build", done: false },
        { id: 3, title: "Ship", done: false },
      ],
    });

    const getDelta = captureStoreUpdates(board);

    type DeltaEntry = { path: string; value: string };
    const [deltaLog, setDeltaLog] = createSignal<DeltaEntry[][]>([]);
    let ready = false;

    createEffect(
      () => getDelta(),
      updates => {
        if (!ready) {
          ready = true;
          return;
        }
        if (updates.length === 0) return;
        setDeltaLog(prev =>
          [
            updates.map(u => ({
              path: `[${u.path.map(String).join(", ")}]`,
              value: JSON.stringify(u.value, null, 2),
            })),
            ...prev,
          ].slice(0, 4),
        );
      },
    );

    return (
      <Container width={340}>
        <Section title="Tasks">
          <For each={board.tasks}>
            {(task, i) => (
              <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() =>
                    setBoard(s => {
                      s.tasks[i()].done = !s.tasks[i()].done;
                    })
                  }
                />
                <input
                  type="text"
                  value={task.title}
                  onInput={e =>
                    setBoard(s => {
                      s.tasks[i()].title = e.currentTarget.value;
                    })
                  }
                  style={{
                    flex: 1,
                    border: `1px solid ${colors.border}`,
                    "border-radius": radii.sm,
                    padding: "0.25rem 0.4rem",
                    "font-size": font.sizeBase,
                    "font-family": font.system,
                    "text-decoration": task.done ? "line-through" : "none",
                    color: task.done ? colors.mutedFg : "inherit",
                  }}
                />
              </div>
            )}
          </For>
        </Section>
        <Separator />
        <Section title="Delta log (path → changed node)">
          <Show
            when={deltaLog().length > 0}
            fallback={
              <span style={{ "font-size": font.sizeSm, color: colors.mutedFg }}>
                Make a change to see deltas…
              </span>
            }
          >
            <For each={deltaLog()}>
              {(entries, batchIndex) => (
                <div
                  style={{
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    "border-radius": radii.md,
                    padding: "0.4rem 0.6rem",
                    "line-height": "1.6",
                    opacity: batchIndex() === 0 ? 1 : 0.4,
                    "font-family": font.mono,
                    "font-size": "0.78rem",
                  }}
                >
                  <For each={entries}>
                    {entry => (
                      <div>
                        <span style={{ color: colors.muted }}>path </span>
                        <span style={{ color: colors.primary }}>{entry.path}</span>
                        <pre
                          style={{
                            margin: "0.15rem 0 0",
                            color: colors.secondaryFg,
                            "white-space": "pre-wrap",
                            "word-break": "break-all",
                          }}
                        >
                          {entry.value}
                        </pre>
                      </div>
                    )}
                  </For>
                </div>
              )}
            </For>
          </Show>
        </Section>
      </Container>
    );
  },
});
