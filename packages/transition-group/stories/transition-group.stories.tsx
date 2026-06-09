import { createMemo, createSignal, For } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createListTransition, createSwitchTransition } from "../src/index.js";
import readme from "../README.md?raw";
import { Button, ButtonRow, Container } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Animation/Transition Group",
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

// ─── createSwitchTransition ───────────────────────────────────────────────────

export const SwitchFade = meta.story({
  name: "Fade between elements",
  parameters: {
    docs: {
      description: {
        story:
          "`createSwitchTransition` detects when the source element reference changes and fires `onEnter`/`onExit`. In the default **parallel** mode both animations run simultaneously.",
      },
    },
  },
  render: () => {
    const TABS = [
      { label: "Alpha", color: "#6366f1" },
      { label: "Beta", color: "#0ea5e9" },
      { label: "Gamma", color: "#10b981" },
    ];
    const [active, setActive] = createSignal(0);

    // A fresh element is returned each time `active` changes so the transition
    // detects a new reference and fires enter/exit callbacks.
    const source = createMemo((): HTMLElement => {
      const { color, label } = TABS[active()]!;
      const el = document.createElement("div");
      Object.assign(el.style, {
        position: "absolute",
        inset: "0",
        display: "flex",
        "align-items": "center",
        "padding-left": "1rem",
        background: color + "18",
        "border-left": `3px solid ${color}`,
        "border-radius": "6px",
        "font-size": "0.9rem",
        color,
        "font-weight": "600",
      });
      el.textContent = label;
      return el;
    });

    const transition = createSwitchTransition(source, {
      onEnter(el, done) {
        queueMicrotask(() => {
          if (!el.isConnected) return done();
          el.animate(
            [{ opacity: 0, transform: "translateY(5px)" }, { opacity: 1, transform: "none" }],
            { duration: 250, easing: "ease-out" },
          ).finished.then(done).catch(done);
        });
      },
      onExit(el, done) {
        el.animate(
          [{ opacity: 1 }, { opacity: 0, transform: "translateY(-5px)" }],
          { duration: 200 },
        ).finished.then(done).catch(done);
      },
    });

    return (
      <Container width={340}>
        <ButtonRow>
          <For each={TABS}>
            {(tab, i) => (
              <Button
                onClick={() => setActive(i())}
                variant={active() === i() ? "primary" : "outline"}
                style={{ flex: "1" }}
              >
                {tab.label}
              </Button>
            )}
          </For>
        </ButtonRow>
        <div style={{ position: "relative", height: "50px" }}>{transition()}</div>
      </Container>
    );
  },
});

export const SwitchModes = meta.story({
  name: "Sequence modes",
  parameters: {
    docs: {
      description: {
        story:
          "The `mode` option controls timing. `\"parallel\"` — both run at once. `\"out-in\"` — exit finishes before enter starts. `\"in-out\"` — enter starts first, exit fires after enter completes.",
      },
    },
  },
  render: () => {
    function Demo(props: { mode: "parallel" | "out-in" | "in-out" }) {
      const [toggle, setToggle] = createSignal(true);

      const source = createMemo((): HTMLElement => {
        const on = toggle();
        const el = document.createElement("div");
        Object.assign(el.style, {
          position: "absolute",
          inset: "0",
          display: "flex",
          "align-items": "center",
          "padding-left": "0.75rem",
          background: on ? "#6366f118" : "#0ea5e918",
          "border-left": `3px solid ${on ? "#6366f1" : "#0ea5e9"}`,
          "border-radius": "6px",
          "font-size": "0.82rem",
          color: on ? "#6366f1" : "#0ea5e9",
          "font-weight": "600",
        });
        el.textContent = on ? "Element A" : "Element B";
        return el;
      });

      const transition = createSwitchTransition(source, {
        onEnter(el, done) {
          queueMicrotask(() => {
            if (!el.isConnected) return done();
            el.animate(
              [{ opacity: 0, transform: "translateX(12px)" }, { opacity: 1, transform: "none" }],
              { duration: 260, easing: "ease-out" },
            ).finished.then(done).catch(done);
          });
        },
        onExit(el, done) {
          el.animate(
            [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(-12px)" }],
            { duration: 210 },
          ).finished.then(done).catch(done);
        },
        mode: props.mode,
        appear: true,
      });

      return (
        <div style={{ display: "flex", "align-items": "center", gap: "0.5rem" }}>
          <Button
            onClick={() => setToggle(t => !t)}
            variant="outline"
            style={{ "flex-shrink": "0", padding: "0.4rem 0.7rem" }}
          >
            Toggle
          </Button>
          <div style={{ position: "relative", flex: "1", height: "38px" }}>{transition()}</div>
          <code style={{ "font-size": "0.75rem", color: "#64748b", "min-width": "64px", "text-align": "right" }}>
            {props.mode}
          </code>
        </div>
      );
    }

    return (
      <Container width={380}>
        <Demo mode="parallel" />
        <Demo mode="out-in" />
        <Demo mode="in-out" />
      </Container>
    );
  },
});

// ─── createListTransition ─────────────────────────────────────────────────────

export const ListAddRemove = meta.story({
  name: "Add & remove items",
  parameters: {
    docs: {
      description: {
        story:
          "`createListTransition` passes `added`, `removed`, and `unchanged` arrays to `onChange` on every source change. Call `finishRemoved(els)` once exit animations are done to remove elements from the DOM.",
      },
    },
  },
  render: () => {
    let nextId = 4;
    type Item = { id: number; label: string };
    const [items, setItems] = createSignal<Item[]>([
      { id: 1, label: "Item 1" },
      { id: 2, label: "Item 2" },
      { id: 3, label: "Item 3" },
    ]);

    const elCache = new Map<number, HTMLElement>();

    function getEl(item: Item): HTMLElement {
      if (!elCache.has(item.id)) {
        const el = document.createElement("div");
        Object.assign(el.style, {
          display: "flex",
          "align-items": "center",
          "justify-content": "space-between",
          padding: "0.45rem 0.75rem",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          "border-radius": "6px",
          "font-size": "0.875rem",
          "box-sizing": "border-box",
        });
        const span = document.createElement("span");
        span.style.color = "#334155";
        span.textContent = item.label;
        const btn = document.createElement("button");
        btn.textContent = "×";
        Object.assign(btn.style, {
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#94a3b8",
          "font-size": "1rem",
          padding: "0 0.2rem",
          "line-height": "1",
        });
        btn.addEventListener("click", () =>
          setItems(prev => prev.filter(i => i.id !== item.id)),
        );
        el.appendChild(span);
        el.appendChild(btn);
        elCache.set(item.id, el);
      }
      return elCache.get(item.id)!;
    }

    const source = () => items().map(getEl);

    const transition = createListTransition(source, {
      exitMethod: "keep-index",
      onChange({ added, removed, finishRemoved }) {
        queueMicrotask(() => {
          added.forEach(el => {
            if (!el.isConnected) return;
            el.animate(
              [
                { opacity: 0, transform: "translateX(-8px)" },
                { opacity: 1, transform: "none" },
              ],
              { duration: 230, easing: "ease-out" },
            );
          });

          if (removed.length) {
            const anims = removed.map(el => {
              if (!el.isConnected) return Promise.resolve();
              return el.animate(
                [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.95)" }],
                { duration: 200 },
              ).finished;
            });
            Promise.all(anims).then(() => finishRemoved(removed));
          }
        });
      },
    });

    return (
      <Container width={300}>
        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            gap: "0.35rem",
            position: "relative",
            "min-height": "80px",
          }}
        >
          {transition()}
        </div>
        <Button
          onClick={() => {
            const id = nextId++;
            setItems(prev => [...prev, { id, label: `Item ${id}` }]);
          }}
        >
          + Add item
        </Button>
      </Container>
    );
  },
});

export const ListFlip = meta.story({
  name: "Reorder with FLIP",
  parameters: {
    docs: {
      description: {
        story:
          "FLIP animation: record each element's rect before the DOM update (`onChange`), then in `queueMicrotask` measure new rects, compute the diff, and play a corrective `translateY` animation. The `unchanged` array contains every element present in both the old and new list.",
      },
    },
  },
  render: () => {
    const COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"] as const;
    type ListItem = { id: number; color: string };
    const [items, setItems] = createSignal<ListItem[]>(
      COLORS.map((color, i) => ({ id: i + 1, color })),
    );

    const elCache = new Map<number, HTMLElement>();

    function getEl(item: ListItem): HTMLElement {
      if (!elCache.has(item.id)) {
        const el = document.createElement("div");
        Object.assign(el.style, {
          display: "flex",
          "align-items": "center",
          padding: "0.5rem 0.75rem",
          background: item.color + "12",
          "border-left": `3px solid ${item.color}`,
          "border-radius": "6px",
          "font-size": "0.875rem",
          color: item.color,
          "font-weight": "600",
          "will-change": "transform",
        });
        el.textContent = `Item ${item.id}`;
        elCache.set(item.id, el);
      }
      return elCache.get(item.id)!;
    }

    const source = () => items().map(getEl);

    const transition = createListTransition(source, {
      exitMethod: "remove",
      onChange({ unchanged }) {
        // Capture old positions before DOM updates
        const rects = new Map(unchanged.map(el => [el, el.getBoundingClientRect()]));
        queueMicrotask(() => {
          unchanged.forEach(el => {
            if (!el.isConnected) return;
            const old = rects.get(el);
            if (!old) return;
            const now = el.getBoundingClientRect();
            const dy = old.top - now.top;
            if (dy !== 0) {
              el.animate(
                [{ transform: `translateY(${dy}px)` }, { transform: "none" }],
                { duration: 320, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
              );
            }
          });
        });
      },
    });

    function shuffle<T>(arr: readonly T[]): T[] {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j]!, a[i]!];
      }
      return a;
    }

    return (
      <Container width={300}>
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.35rem" }}>
          {transition()}
        </div>
        <ButtonRow>
          <Button
            onClick={() => setItems(prev => [...prev].reverse())}
            style={{ flex: "1" }}
          >
            Reverse
          </Button>
          <Button
            onClick={() => setItems(shuffle)}
            variant="outline"
            style={{ flex: "1" }}
          >
            Shuffle
          </Button>
        </ButtonRow>
      </Container>
    );
  },
});
